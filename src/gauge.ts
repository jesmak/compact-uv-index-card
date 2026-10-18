/** Reading the UV sensor: its value, and how an index is written. */
import type { HassEntity, HomeAssistant } from "./hass";

/** Shown in place of a figure the sensor can't give. */
export const NO_VALUE = "—";

/** The sensor's number, or nothing while it is unavailable or unknown. */
export function valueOf(entity: HassEntity | undefined): number | null {
    if (!entity) {
        return null;
    }
    const value = Number.parseFloat(entity.state);
    return Number.isFinite(value) ? value : null;
}

/** The precision the sensor is shown in, if it has one of its own in Home Assistant. */
export function precisionOf(hass: HomeAssistant, entityId: string): number | undefined {
    const precision = hass.entities?.[entityId]?.display_precision;
    return typeof precision === "number" && precision >= 0 ? precision : undefined;
}

/**
 * The index as it is shown: rounded to the sensor's own precision, or to a decimal. Its level and rays are read
 * from this, so that a figure of 2.5 is never called low while 2.5 itself is moderate.
 */
export function shownValue(value: number | null, precision?: number): number | null {
    if (value === null) {
        return null;
    }
    const scale = 10 ** (precision ?? 1);
    return Math.round(value * scale) / scale;
}

/**
 * An index in the viewer's locale: in the sensor's own precision when it has one, otherwise to one decimal at
 * most. An index has no unit to show.
 */
export function indexText(value: number | null, language: string, precision?: number): string {
    if (value === null) {
        return NO_VALUE;
    }
    const digits =
        precision === undefined ? { maximumFractionDigits: 1 } : { minimumFractionDigits: precision, maximumFractionDigits: precision };
    return new Intl.NumberFormat(language, digits).format(value);
}

/**
 * A UV sensor to offer when the card is added from the picker. Home Assistant has no device class for it, so it
 * goes by the name, `uv` or `uvi` as a word of its own or `uv_index`, or a unit that says UV.
 */
export function findUvSensor(hass: HomeAssistant | undefined): string | undefined {
    return Object.values(hass?.states ?? {}).find((entity): entity is HassEntity => {
        if (!entity || !entity.entity_id.startsWith("sensor.")) {
            return false;
        }
        const unit = entity.attributes.unit_of_measurement;
        return /(^|_)uvi?(_|$)|uv_?index/i.test(entity.entity_id.slice(7)) || (typeof unit === "string" && /\buv\b/i.test(unit));
    })?.entity_id;
}
