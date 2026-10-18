/**
 * The WHO's five exposure levels of the UV index and their colours. The index is read rounded to a whole number,
 * as it is reported and as the levels are defined: 2.6 is a 3, which is moderate.
 */

export type Level = "low" | "moderate" | "high" | "very_high" | "extreme";

export const LEVELS: Level[] = ["low", "moderate", "high", "very_high", "extreme"];

/** The WHO's colours, which every UV index chart uses. A theme can override each with `--uv-index-<level>-color`. */
const COLOURS: Record<Level, string> = {
    low: "#4eb400",
    moderate: "#f7e400",
    high: "#f85900",
    very_high: "#d8001d",
    extreme: "#6b49c8",
};

/** The index as a whole number, never below zero. */
export function roundedIndex(value: number): number {
    return Math.max(Math.round(value), 0);
}

/** The level of an index, or nothing without a reading. */
export function levelOf(value: number | null): Level | null {
    if (value === null) {
        return null;
    }
    const index = roundedIndex(value);
    return index >= 11 ? "extreme" : index >= 8 ? "very_high" : index >= 6 ? "high" : index >= 3 ? "moderate" : "low";
}

export function colourOf(level: Level): string {
    return `var(--uv-index-${level.replace("_", "-")}-color, ${COLOURS[level]})`;
}

/** The WHO's advice: protect yourself from 3 on, and avoid the midday sun from 8 on. Below 3 none is needed. */
export function adviceOf(level: Level | null): "protect" | "avoid" | null {
    if (level === "very_high" || level === "extreme") {
        return "avoid";
    }
    return level === "moderate" || level === "high" ? "protect" : null;
}
