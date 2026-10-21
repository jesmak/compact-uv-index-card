import { describe, expect, it } from "vitest";

import { MARKS, indexAt, lineOf, stepsShown } from "../src/chart";
import type { CompactUvIndexChart } from "../src/chart";
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

describe("the marker lines", () => {
    it("are where the colour changes, half below each of the WHO's steps", () => {
        for (const step of MARKS) {
            expect(levelOf(lineOf(step) - 0.01)).not.toBe(levelOf(lineOf(step)));
            expect(lineOf(step)).toBe(step - 0.5);
        }
    });

    it.each([
        [3, [3]],
        [5.4, [3]],
        [5.5, [3, 6]],
        [6, [3, 6]],
        [9, [3, 8]],
        [12, [3, 8]],
        [15, [6]],
        [20, [6]],
        [35, [8]],
        [50, [11]],
        [60, []],
    ])("show the steps the chart reaches, apart enough for their values, at a top of %s", (top, steps) => {
        expect(stepsShown(top)).toEqual(steps);
    });
});

describe("the chart's axis", () => {
    async function chart(values: number[], language: string): Promise<ShadowRoot> {
        const element = document.createElement("compact-uv-index-chart") as CompactUvIndexChart;
        element.kind = "bars";
        element.floor = 3;
        element.language = language;
        element.items = values.map((value, index) => ({ time: index, value, colour: "#000", label: "" }));
        document.body.append(element);
        await element.updateComplete;
        return element.shadowRoot as ShadowRoot;
    }

    it("labels each line with its step, at the line's height, with an unseen sizer for each label", async () => {
        const root = await chart([2, 9], "fi");
        const labels = [...root.querySelectorAll<HTMLElement>(".value")];
        const lines = [...root.querySelectorAll(".mark")];
        expect(labels.map((label) => label.textContent)).toEqual(["3", "8"]);
        expect(labels.map((label) => parseFloat(label.style.top))).toEqual(
            lines.map((line) => (Number(line.getAttribute("y1")) / 32) * 100),
        );
        expect([...root.querySelectorAll(".sizer")].map((sizer) => sizer.textContent)).toEqual(["3", "8"]);
    });

    it("is left out when no line fits, and the plot takes the whole width", async () => {
        const root = await chart([60], "en");
        expect(root.querySelector(".axis")).toBeNull();
        expect(root.querySelectorAll(".mark")).toHaveLength(0);
    });
});
