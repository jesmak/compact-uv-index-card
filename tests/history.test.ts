import { describe, expect, it } from "vitest";

import { DAY, HOUR, daysFromHourly, lastDays, peakOf, pointsOf, todayPeak } from "../src/history";
import type { DayPeak } from "../src/history";

const ZONE = "Europe/Helsinki";
// Noon in Helsinki, 22 June 2026.
const NOW = Date.parse("2026-06-22T09:00:00Z");
const at = (iso: string) => Date.parse(iso);

describe("the days", () => {
    it("are the last ones in Home Assistant's time zone, oldest first", () => {
        expect(lastDays(3, NOW, ZONE).map((day) => day.day)).toEqual(["2026-06-20", "2026-06-21", "2026-06-22"]);
    });

    it("neither skip nor repeat a day across a change of daylight saving time", () => {
        const days = lastDays(4, Date.parse("2026-10-26T00:30:00+02:00"), ZONE).map((day) => day.day);
        expect(days).toEqual(["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26"]);
    });
});

describe("a day's peak", () => {
    it("is the highest of its hourly maximums, in Home Assistant's time zone", () => {
        const rows = [
            { start: at("2026-06-21T08:00:00Z"), max: 5.2 },
            { start: at("2026-06-21T10:00:00Z"), max: 6.8 },
            { start: at("2026-06-21T15:00:00Z"), max: 2.1 },
            // 22.00 UTC is already the next day in Helsinki.
            { start: at("2026-06-21T22:00:00Z"), max: 0.1 },
            { start: at("2026-06-22T07:00:00Z"), max: 4.4 },
            { start: at("2026-06-22T08:00:00Z"), max: null },
        ];
        const days = daysFromHourly(rows, lastDays(3, NOW, ZONE), ZONE);
        expect(days.map((day) => day.peak)).toEqual([null, 6.8, 4.4]);
    });
});

describe("reading the days", () => {
    const days: DayPeak[] = [4, 0, null, 7.2, 0.5, 1].map((peak, index) => ({
        day: `2026-06-${17 + index}`,
        time: NOW - (5 - index) * DAY,
        peak,
    }));

    it("give the highest of the last days, skipping unknown ones", () => {
        expect(peakOf(days, 3)).toBe(7.2);
        expect(peakOf(days, 2)).toBe(1);
        expect(peakOf(days, 6)).toBe(7.2);
    });

    it("give nothing when the recorder doesn't reach back that far, or knows nothing", () => {
        expect(peakOf(days, 7)).toBeNull();
        expect(peakOf(days.slice(2, 3), 1)).toBeNull();
    });
});

describe("today's peak", () => {
    it("is the highest reading since midnight, the live state included", () => {
        const points = [
            // Yesterday's evening, not counted.
            { time: at("2026-06-21T18:00:00Z"), value: 3.9 },
            { time: NOW - 3 * HOUR, value: 2.5 },
            { time: NOW - HOUR, value: 5.1 },
        ];
        expect(todayPeak(points, 4.6, NOW, ZONE)).toBe(5.1);
        expect(todayPeak(points, 6.2, NOW, ZONE)).toBe(6.2);
    });

    it("is nothing with no readings today and the sensor unavailable", () => {
        expect(todayPeak([{ time: at("2026-06-21T18:00:00Z"), value: 3.9 }], null, NOW, ZONE)).toBeNull();
    });
});

describe("the readings", () => {
    it("are read from a minimal history answer, in order, skipping what is no number", () => {
        const answer = {
            "sensor.uv": [
                { s: "0.4", lu: 1_700_000_100 },
                { s: "unavailable", lu: 1_700_000_200 },
                { s: "0.0", lu: 1_700_000_000 },
            ],
        };
        expect(pointsOf(answer, "sensor.uv")).toEqual([
            { time: 1_700_000_000_000, value: 0 },
            { time: 1_700_000_100_000, value: 0.4 },
        ]);
    });
});
