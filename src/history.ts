/**
 * The UV index of past days and hours, from Home Assistant's recorder.
 *
 * A day's highest index is read from the long-term statistics, which are kept for good, not from the state
 * history, which is kept for ten days by default: it is the highest of the day's hourly maximums. The statistics
 * reach only to the last full hour, so today's highest comes from the state history since midnight instead.
 */
import type { HomeAssistant } from "./hass";

/** One row of `recorder/statistics_during_period`. Times are milliseconds. */
export interface StatisticRow {
    start: number;
    end?: number;
    max?: number | null;
}

/** A day's highest index, or `null` when the recorder has nothing for it. */
export interface DayPeak {
    day: string;
    /** A moment inside the day, for formatting its date. */
    time: number;
    peak: number | null;
}

/** A reading of the sensor. */
export interface Point {
    time: number;
    value: number;
}

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
/** How far the peaks look back: the past week, and the past month, the longest. */
export const WEEK_DAYS = 7;
export const LOOKBACK_DAYS = 30;
/** The hourly chart reads the state history, which the recorder keeps for ten days by default. */
export const MAX_HOURLY_CHART_HOURS = 168;

/** A function that gives the calendar day of a moment in Home Assistant's time zone, as `YYYY-MM-DD`. */
export function dayFormatter(timeZone?: string): (time: number) => string {
    const format = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return (time) => {
        const parts = format.formatToParts(new Date(time));
        const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? "";
        return `${part("year")}-${part("month")}-${part("day")}`;
    };
}

/**
 * The last `count` days, oldest first and ending today, each with a moment inside it. Stepping back a few
 * hours at a time never skips or repeats a day, whatever daylight saving time does.
 */
export function lastDays(count: number, now: number, timeZone?: string): Array<{ day: string; time: number }> {
    const dayOf = dayFormatter(timeZone);
    const days: Array<{ day: string; time: number }> = [];
    for (let time = now; days.length < count; time -= 6 * HOUR) {
        const day = dayOf(time);
        if (days[0]?.day !== day) {
            days.unshift({ day, time });
        }
    }
    return days;
}

/** Days from hourly maximums: each day's peak is the highest of its hours on record. */
export function daysFromHourly(rows: StatisticRow[], days: Array<{ day: string; time: number }>, timeZone?: string): DayPeak[] {
    const dayOf = dayFormatter(timeZone);
    const peaks = new Map<string, number>();
    for (const row of rows) {
        if (typeof row.max === "number") {
            const day = dayOf(row.start);
            peaks.set(day, Math.max(peaks.get(day) ?? row.max, row.max));
        }
    }
    return days.map(({ day, time }) => ({ day, time, peak: peaks.get(day) ?? null }));
}

/** The highest index of the last `count` days, today included. */
export function peakOf(days: DayPeak[], count: number): number | null {
    const recent = days.slice(-count).filter((day) => day.peak !== null);
    if (days.length < count || recent.length === 0) {
        return null;
    }
    return Math.max(...recent.map((day) => day.peak ?? 0));
}

/** The highest index of today: of the readings since midnight, and the sensor's own state now. */
export function todayPeak(points: Point[], live: number | null, now: number, timeZone?: string): number | null {
    const dayOf = dayFormatter(timeZone);
    const today = dayOf(now);
    const values = points.filter((point) => dayOf(point.time) === today).map((point) => point.value);
    if (live !== null) {
        values.push(live);
    }
    return values.length === 0 ? null : Math.max(...values);
}

/** The readings in a minimal `history/history_during_period` answer. */
export function pointsOf(answer: Record<string, Array<Record<string, unknown>>> | undefined, id: string): Point[] {
    const points: Point[] = [];
    for (const row of answer?.[id] ?? []) {
        const value = Number.parseFloat(String(row.s));
        const seconds = Number(row.lu ?? row.lc);
        if (Number.isFinite(value) && Number.isFinite(seconds)) {
            points.push({ time: seconds * 1000, value });
        }
    }
    return points.sort((one, other) => one.time - other.time);
}

/** The highest index of the last `count` days, ending today, from the hourly statistics. */
export async function fetchDays(hass: HomeAssistant, id: string, count: number, now: number): Promise<DayPeak[]> {
    const days = lastDays(count, now, hass.config?.time_zone);
    if (!hass.callWS) {
        return days.map(({ day, time }) => ({ day, time, peak: null }));
    }
    const answer = await hass.callWS<Record<string, StatisticRow[]>>({
        type: "recorder/statistics_during_period",
        start_time: new Date(days[0].time - DAY).toISOString(),
        end_time: new Date(now).toISOString(),
        statistic_ids: [id],
        period: "hour",
        types: ["max"],
    });
    return daysFromHourly(answer?.[id] ?? [], days, hass.config?.time_zone);
}

/** The sensor's readings over the last hours. */
export async function fetchPoints(hass: HomeAssistant, id: string, hours: number, now: number): Promise<Point[]> {
    if (!hass.callWS) {
        return [];
    }
    const answer = await hass.callWS<Record<string, Array<Record<string, unknown>>>>({
        type: "history/history_during_period",
        start_time: new Date(now - hours * HOUR).toISOString(),
        end_time: new Date(now).toISOString(),
        entity_ids: [id],
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
    });
    return pointsOf(answer, id);
}
