/** The little of Home Assistant a card needs, so the unmaintained custom-card-helpers isn't a dependency. */

export interface HassEntity {
    entity_id: string;
    state: string;
    last_changed: string;
    attributes: Record<string, unknown>;
}

export interface HomeAssistant {
    states: Record<string, HassEntity | undefined>;
    /** The entity registry's display settings, such as the precision a sensor is shown in. */
    entities?: Record<string, { display_precision?: number } | undefined>;
    language?: string;
    locale?: { language?: string };
    /** A state as Home Assistant shows it: localised, rounded to the sensor's precision, with its unit. */
    formatEntityState?: (entity: HassEntity, state?: string) => string;
    /** A websocket command, such as a recorder query. */
    callWS?: <T>(message: Record<string, unknown>) => Promise<T>;
    config?: { time_zone?: string };
}

export interface LovelaceCardConfig {
    type: string;
    [key: string]: unknown;
}

/** What Home Assistant does on a tap, hold or double tap. Its own action handler reads it. */
export interface ActionConfig {
    action: string;
    [key: string]: unknown;
}
