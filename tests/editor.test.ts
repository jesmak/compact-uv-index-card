import { beforeEach, describe, expect, it } from "vitest";

import { formData } from "../src/editor";
import type { CompactUvIndexCardEditor } from "../src/editor";
import type { HomeAssistant } from "../src/hass";
import type { CompactUvIndexCardConfig } from "../src/types";

const hass: HomeAssistant = { locale: { language: "fi" }, states: {} };

async function editor(config: Partial<CompactUvIndexCardConfig> = {}): Promise<CompactUvIndexCardEditor> {
    const element = document.createElement("compact-uv-index-card-editor") as CompactUvIndexCardEditor;
    element.setConfig({ type: "custom:compact-uv-index-card", entity: "sensor.uv", ...config } as never);
    element.hass = hass;
    document.body.append(element);
    await element.updateComplete;
    return element;
}

type Form = HTMLElement & {
    schema: Array<Record<string, unknown>>;
    computeLabel: (entry: { name: string }) => string;
    computeHelper: (entry: { name: string }) => string | undefined;
};

function form(element: CompactUvIndexCardEditor): Form {
    const found = element.shadowRoot?.querySelector("ha-form");
    if (!found) {
        throw new Error("the editor rendered no form");
    }
    return found as Form;
}

function names(schema: Array<Record<string, unknown>>): string[] {
    return schema.flatMap((entry) =>
        Array.isArray(entry.schema) ? names(entry.schema as Array<Record<string, unknown>>) : [String(entry.name)],
    );
}

beforeEach(() => {
    document.body.innerHTML = "";
});

describe("the editor", () => {
    it("offers every option, in the viewer's language", async () => {
        const found = form(await editor());
        expect(names(found.schema)).toEqual([
            "entity",
            "language",
            "animate_sun",
            "show_level",
            "show_advice",
            "show_yesterday",
            "show_week",
            "show_month",
            "border_colour",
            "show_daily_chart",
            "daily_chart_days",
            "show_hourly_chart",
            "hourly_chart_hours",
            "tap_action",
            "hold_action",
            "double_tap_action",
        ]);
        expect(found.computeLabel({ name: "entity" })).toBe("UV-indeksin sensori");
        expect(found.computeHelper({ name: "show_advice" })).toContain("3");
        expect(found.computeHelper({ name: "border_colour" })).toBeUndefined();
    });

    it("offers the languages the card has", async () => {
        const found = form(await editor());
        const language = found.schema.find((entry) => entry.name === "language") as
            { selector: { select: { options: Array<{ value: string }> } } } | undefined;
        expect(language?.selector.select.options.map((option) => option.value)).toEqual(["en", "fi"]);
    });

    it("leaves defaults and emptied options out of the configuration", async () => {
        const element = await editor({ daily_chart_days: 20 });
        const changes: CompactUvIndexCardConfig[] = [];
        element.addEventListener("config-changed", (event) => {
            changes.push((event as CustomEvent<{ config: CompactUvIndexCardConfig }>).detail.config);
        });
        form(element).dispatchEvent(
            new CustomEvent("value-changed", {
                detail: {
                    value: {
                        ...formData({ type: "custom:compact-uv-index-card", entity: "sensor.uv" } as never),
                        language: "",
                        show_daily_chart: true,
                    },
                },
            }),
        );
        expect(changes).toEqual([{ type: "custom:compact-uv-index-card", entity: "sensor.uv", show_daily_chart: true }]);
    });

    it("sends a number option the form can't show to the YAML editor", () => {
        const element = document.createElement("compact-uv-index-card-editor") as CompactUvIndexCardEditor;
        expect(() =>
            element.setConfig({ type: "custom:compact-uv-index-card", entity: "sensor.uv", daily_chart_days: "two" } as never),
        ).toThrow();
    });
});
