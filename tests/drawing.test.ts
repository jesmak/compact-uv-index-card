import { describe, expect, it } from "vitest";

import { indexAt } from "../src/chart";
import { adviceOf, levelOf, roundedIndex } from "../src/levels";
import { litRays } from "../src/sun";

describe("the levels", () => {
    it("follow the WHO's steps on the rounded index", () => {
        const levels = [0, 2.4, 2.5, 5.4, 5.5, 7.4, 7.5, 10.4, 10.5, 14].map((value) => levelOf(value));
        expect(levels).toEqual(["low", "low", "moderate", "moderate", "high", "high", "very_high", "very_high", "extreme", "extreme"]);
        expect(levelOf(null)).toBeNull();
    });

    it("never go below zero, whatever a sensor reports", () => {
        expect(roundedIndex(-0.4)).toBe(0);
        expect(levelOf(-3)).toBe("low");
    });

    it("advise protection from 3 on and avoiding the sun from 8 on", () => {
        expect(["low", "moderate", "high", "very_high", "extreme"].map((level) => adviceOf(level as never))).toEqual([
            null,
            "protect",
            "protect",
            "avoid",
            "avoid",
        ]);
        expect(adviceOf(null)).toBeNull();
    });
});

describe("the rays", () => {
    it("light one for each step of the rounded index, twelve at most", () => {
        expect([null, 0, 0.4, 0.5, 5.4, 11.6, 15].map((value) => litRays(value))).toEqual([0, 0, 0, 1, 5, 12, 12]);
    });
});

describe("pointing at a chart", () => {
    const items = [0, 10, 20].map((time) => ({ time, value: 1, colour: "", label: "" }));

    it("picks the bar in that slot", () => {
        expect(indexAt("bars", items, 0.1, 0, 0)).toBe(0);
        expect(indexAt("bars", items, 0.5, 0, 0)).toBe(1);
        expect(indexAt("bars", items, 0.99, 0, 0)).toBe(2);
    });

    it("picks the latest reading at that moment of a line", () => {
        expect(indexAt("line", items, 0.45, 0, 30)).toBe(1);
        expect(indexAt("line", items, 0.9, 0, 30)).toBe(2);
    });
});
