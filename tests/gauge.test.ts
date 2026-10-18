import { describe, expect, it } from "vitest";

import { findUvSensor, indexText, precisionOf, valueOf } from "../src/gauge";
import type { HassEntity, HomeAssistant } from "../src/hass";

const entity = (id: string, state = "1", attributes: Record<string, unknown> = {}): HassEntity => ({
    entity_id: id,
    state,
    last_changed: "2026-06-22",
    attributes,
});

describe("the sensor's value", () => {
    it("is a number, or nothing while the sensor can't give one", () => {
        expect(valueOf(entity("sensor.uv", "5.4"))).toBe(5.4);
        expect(valueOf(entity("sensor.uv", "unavailable"))).toBeNull();
        expect(valueOf(undefined)).toBeNull();
    });
});

describe("an index", () => {
    it("is written in the locale, to a decimal at most, without a unit", () => {
        expect(indexText(5.43, "en")).toBe("5.4");
        expect(indexText(5.43, "fi")).toBe("5,4");
        expect(indexText(6, "en")).toBe("6");
        expect(indexText(null, "en")).toBe("—");
    });

    it("follows the precision the sensor has in Home Assistant", () => {
        const hass: HomeAssistant = { states: {}, entities: { "sensor.uv": { display_precision: 0 }, "sensor.other": {} } };
        expect(precisionOf(hass, "sensor.uv")).toBe(0);
        expect(precisionOf(hass, "sensor.other")).toBeUndefined();
        expect(indexText(5.6, "en", 0)).toBe("6");
        expect(indexText(5, "en", 1)).toBe("5.0");
    });
});

describe("the sensor offered from the picker", () => {
    it("is one named for UV, or with a UV unit", () => {
        const states = (...entities: HassEntity[]) => ({ states: Object.fromEntries(entities.map((one) => [one.entity_id, one])) });
        expect(findUvSensor(states(entity("sensor.temperature"), entity("sensor.example_uv_index")))).toBe("sensor.example_uv_index");
        expect(findUvSensor(states(entity("sensor.fmi_uvi_example")))).toBe("sensor.fmi_uvi_example");
        expect(findUvSensor(states(entity("sensor.sun_strength", "3", { unit_of_measurement: "UV index" })))).toBe("sensor.sun_strength");
    });

    it("isn't any sensor whose name only has the letters in it", () => {
        expect(findUvSensor({ states: { a: entity("sensor.huvimaja_temperature"), b: entity("sensor.uvula") } })).toBeUndefined();
        expect(findUvSensor({ states: { a: entity("binary_sensor.uv_alarm") } })).toBeUndefined();
    });
});
