import type { ActionConfig, LovelaceCardConfig } from "./hass";
import { browserLanguage, translate } from "./localize/localize";

export interface CompactUvIndexCardConfig extends LovelaceCardConfig {
    /** The UV index now. */
    entity: string;
    border_colour?: string;
    /** A language of its own, instead of Home Assistant's. */
    language?: string;

    /** Lets the lit rays glow while the sun is up. On by default. */
    animate_sun?: boolean;
    /** The level's bars beside the index, and its name under it. On by default. */
    show_level?: boolean;
    /** How to protect yourself, from index 3 on. On by default. */
    show_advice?: boolean;
    /** The highest index of yesterday, and of the last 7 and 30 days. Off by default. */
    show_yesterday?: boolean;
    show_week?: boolean;
    show_month?: boolean;
    /** Each day's highest index, as bars, over `daily_chart_days` days. Off by default. */
    show_daily_chart?: boolean;
    daily_chart_days?: number;
    /** The index over the last `hourly_chart_hours` hours, as a line. Off by default. */
    show_hourly_chart?: boolean;
    hourly_chart_hours?: number;

    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

/** The options' defaults, which the card and the editor both go by. */
export const DEFAULTS = {
    animate_sun: true,
    show_level: true,
    show_advice: true,
    show_yesterday: false,
    show_week: false,
    show_month: false,
    show_daily_chart: false,
    daily_chart_days: 14,
    show_hourly_chart: false,
    hourly_chart_hours: 24,
} as const;

/**
 * Refuses a number option that isn't a number, so that a mistyped one can't quietly mean the default. The charts'
 * lengths are kept in their range by the card.
 */
export function checkNumbers(config: CompactUvIndexCardConfig): void {
    for (const key of ["daily_chart_days", "hourly_chart_hours"] as const) {
        const value: unknown = config[key];
        if (value != null && !(typeof value === "number" && Number.isFinite(value))) {
            throw new Error(translate(browserLanguage(), `common.invalid_${key}`));
        }
    }
}

/** An option's value, or its default. */
export function option<K extends keyof typeof DEFAULTS>(
    config: CompactUvIndexCardConfig,
    key: K,
): (typeof DEFAULTS)[K] extends boolean ? boolean : number {
    const value = config[key];
    return (value ?? DEFAULTS[key]) as never;
}
