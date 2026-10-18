/**
 * A small dashboard card that shows the UV index as a sun with a ray for each step of it, the index and its level
 * beside it, and the day's highest so far. From index 3 on it says how to protect yourself. Below it, when asked
 * for, come the highest index of recent days and two small charts: each day's highest, and the index over the
 * last hours.
 *
 * The card sizes itself to the space it gets. It measures its width with container queries and its height
 * with a ResizeObserver, so it works at any size in a sections view, in a horizontal stack or in a masonry
 * view: the sun and the figures side by side, larger figures when there is room, the sun above the figures
 * when it is narrow, and a small sun beside unlabelled figures when it is low. What doesn't fit under the
 * sun is left out, the hourly chart first.
 */
import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { GestureDetector, isTappable } from "./actions";
import type { Gesture } from "./actions";
import "./chart";
import type { ChartItem } from "./chart";
import { CARD_VERSION } from "./const";
import "./editor";
import { NO_VALUE, findUvSensor, indexText, precisionOf, shownValue, valueOf } from "./gauge";
import type { HassEntity, HomeAssistant } from "./hass";
import { HOUR, LOOKBACK_DAYS, MAX_HOURLY_CHART_HOURS, WEEK_DAYS, dayFormatter, fetchDays, fetchPoints, peakOf, todayPeak } from "./history";
import type { DayPeak, Point } from "./history";
import { LEVELS, adviceOf, colourOf, levelOf } from "./levels";
import type { Level } from "./levels";
import { browserLanguage, translate } from "./localize/localize";
import { SUN_SIZE, sun } from "./sun";
import { checkNumbers, option } from "./types";
import type { CompactUvIndexCardConfig } from "./types";

console.info(
    `%c  COMPACT-UV-INDEX-CARD \n%c  ${CARD_VERSION}    `,
    "color: orange; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray",
);

interface CardRegistration {
    type: string;
    name: string;
    description: string;
    documentationURL?: string;
    preview?: boolean;
}

const registry = window as unknown as { customCards?: CardRegistration[] };
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
    type: "compact-uv-index-card",
    name: translate(browserLanguage(), "common.name"),
    description: translate(browserLanguage(), "common.description"),
    documentationURL: "https://github.com/jesmak/compact-uv-index-card",
    preview: true,
});

/** How often the recorder is asked again. Hourly statistics change once an hour. */
export const REFRESH_INTERVAL = 15 * 60_000;
/** Today's peak needs the readings since midnight, so at least a day of them is always read. */
const TODAY_HOURS = 24;
/** The least the charts' top stands for: index 3, from which protection is needed. */
const CHART_FLOOR = 3;
/** The parts under the sun, in the order they are left out when the card is too low for them. */
const OPTIONAL_PARTS = ["hourly-chart", "daily-chart", "extras", "advice"];

/** Whether the gauge has the height its labelled figures need. */
function labelledFits(gauge: HTMLElement): boolean {
    const figures = gauge.querySelector<HTMLElement>(".figures");
    const figuresFit = !figures || figures.scrollHeight <= figures.clientHeight + 1;
    return figuresFit && gauge.scrollHeight <= gauge.clientHeight + 1;
}

/**
 * Fits the card to the height it has, which CSS can't: in a sections view the grid fixes it, and in a masonry
 * view the contents make it, so only measuring tells the two apart. The parts under the sun are left out,
 * least needed first, until the rest fits the card and the figures keep their labels. Only when even that isn't
 * enough does the gauge go low, its figures without labels. Last, the sun is made as wide as the height it ends
 * up with.
 */
export function fitCard(content: HTMLElement): void {
    const gauge = content.querySelector<HTMLElement>(".gauge");
    content.classList.remove(...OPTIONAL_PARTS.map((part) => `hide-${part}`));
    gauge?.classList.remove("short");
    for (const part of OPTIONAL_PARTS) {
        const fits = content.scrollHeight <= content.clientHeight + 1;
        if (fits && (!gauge || labelledFits(gauge))) {
            break;
        }
        content.classList.add(`hide-${part}`);
    }
    if (!gauge) {
        return;
    }
    gauge.classList.toggle("short", !labelledFits(gauge));
    const style = getComputedStyle(gauge);
    const height = gauge.clientHeight - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0);
    gauge.style.setProperty("--sun-width", `${Math.max(Math.round(height), 0)}px`);
}

@customElement("compact-uv-index-card")
export class CompactUvIndexCard extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private config?: CompactUvIndexCardConfig;
    /** The highest index of recent days, from the recorder. Today's is replaced with today's peak. */
    @state() private days?: DayPeak[];
    /** The sensor's readings of the last day or more, for today's peak and the hourly chart. */
    @state() private points?: Point[];

    private readonly gestures = new GestureDetector(
        () => this.config,
        (gesture) => this.act(gesture),
    );
    /** Fits the card again whenever its height, or the gauge's, changes. */
    private readonly resizer =
        typeof ResizeObserver === "undefined"
            ? undefined
            : new ResizeObserver(() => {
                  const content = this.renderRoot.querySelector<HTMLElement>(".content");
                  if (content) {
                      fitCard(content);
                  }
              });
    private observed: Element[] = [];
    private timer?: ReturnType<typeof setInterval>;
    /** When the recorder was last asked, or 0 when it is to be asked again at the next update. */
    private fetchedAt = 0;
    private fetching = false;

    public static getConfigElement(): HTMLElement {
        return document.createElement("compact-uv-index-card-editor");
    }

    /** Offers a UV sensor that is there when the card is added from the picker. */
    public static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
        const entity = findUvSensor(hass);
        return entity ? { entity } : {};
    }

    public setConfig(config: CompactUvIndexCardConfig): void {
        if (!config || typeof config.entity !== "string" || config.entity === "") {
            throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
        }
        checkNumbers(config);
        this.config = { ...config };
        this.days = undefined;
        this.points = undefined;
        this.fetchedAt = 0;
    }

    public getCardSize(): number {
        return 3 + this.parts();
    }

    /** Three rows of a sections view and half its width, and a row more for the peaks and for each chart. */
    public getGridOptions(): Record<string, number> {
        return { columns: 6, rows: 3 + this.parts(), min_columns: 3, min_rows: 1 };
    }

    /**
     * A card taken off the page and put back, as a masonry view does when it moves cards between columns, isn't
     * rendered again by itself: the update watches its size again, and asks the recorder if the days are old.
     */
    public connectedCallback(): void {
        super.connectedCallback();
        this.timer = setInterval(() => void this.refresh(), REFRESH_INTERVAL);
        this.requestUpdate();
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        clearInterval(this.timer);
        this.gestures.dispose();
        this.resizer?.disconnect();
        this.observed = [];
    }

    protected shouldUpdate(changed: PropertyValues): boolean {
        if (!this.config || changed.size > 1 || !changed.has("hass")) {
            return true;
        }
        const previous = changed.get("hass") as HomeAssistant | undefined;
        if (!previous || previous.locale !== this.hass?.locale || previous.language !== this.hass?.language) {
            return true;
        }
        return previous.states[this.config.entity] !== this.hass?.states[this.config.entity];
    }

    protected updated(): void {
        const watched = [this.renderRoot.querySelector(".gauge"), this.renderRoot.querySelector(".content")].filter(
            (element): element is Element => element !== null,
        );
        if (watched.length !== this.observed.length || watched.some((element, index) => element !== this.observed[index])) {
            this.resizer?.disconnect();
            watched.forEach((element) => this.resizer?.observe(element));
            this.observed = watched;
        }
        // A part can come or go without the card changing size, as the level's line does when the sensor comes
        // back, and no observer would notice.
        const content = this.renderRoot.querySelector<HTMLElement>(".content");
        if (content) {
            fitCard(content);
        }
        if (this.isStale()) {
            void this.refresh();
        }
    }

    /** Whether the recorder is to be asked again: never asked, asked too long ago, or the day has changed since. */
    private isStale(): boolean {
        if (this.fetchedAt === 0 || Date.now() - this.fetchedAt >= REFRESH_INTERVAL) {
            return true;
        }
        const last = this.days?.[this.days.length - 1];
        return last !== undefined && last.day !== this.today();
    }

    private today(): string {
        return dayFormatter(this.hass?.config?.time_zone)(Date.now());
    }

    /** Asks the recorder for the readings of today, and for the days the options need. */
    private async refresh(): Promise<void> {
        const hass = this.hass;
        const config = this.config;
        if (!hass?.callWS || !config || !hass.states[config.entity] || this.fetching) {
            return;
        }
        this.fetching = true;
        this.fetchedAt = Date.now();
        const now = Date.now();
        const count = this.daysNeeded();
        const hours = Math.max(TODAY_HOURS, option(config, "show_hourly_chart") ? this.chartHours() : 0);
        const quietly = <T>(promise: Promise<T>) => promise.catch(() => undefined);
        try {
            const [days, points] = await Promise.all([
                count > 0 ? quietly(fetchDays(hass, config.entity, count, now)) : undefined,
                quietly(fetchPoints(hass, config.entity, hours, now)),
            ]);
            if (config === this.config) {
                this.days = days;
                this.points = points;
            }
        } finally {
            this.fetching = false;
        }
        // The configuration changed while the recorder was being asked, so its answer was for the old one.
        if (config !== this.config) {
            void this.refresh();
        }
    }

    /** How many days the options need. */
    private daysNeeded(): number {
        const config = this.config;
        if (!config) {
            return 0;
        }
        const needs = [
            option(config, "show_daily_chart") ? this.chartDays() : 0,
            option(config, "show_month") ? LOOKBACK_DAYS : 0,
            option(config, "show_week") ? WEEK_DAYS : 0,
            option(config, "show_yesterday") ? 2 : 0,
        ];
        return Math.max(...needs);
    }

    private chartDays(): number {
        return this.config ? Math.min(Math.max(option(this.config, "daily_chart_days"), 2), 60) : 0;
    }

    private chartHours(): number {
        return this.config ? Math.min(Math.max(option(this.config, "hourly_chart_hours"), 1), MAX_HOURLY_CHART_HOURS) : 0;
    }

    /** How many parts go under the sun: the peaks, and each chart. The advice comes and goes with the sun. */
    private parts(): number {
        const config = this.config;
        if (!config) {
            return 0;
        }
        const peaks = option(config, "show_yesterday") || option(config, "show_week") || option(config, "show_month");
        return [peaks, option(config, "show_daily_chart"), option(config, "show_hourly_chart")].filter(Boolean).length;
    }

    /** Today's peak, once the readings since midnight are in. */
    private peakToday(entity: HassEntity): number | null | undefined {
        if (!this.points) {
            return this.hass?.callWS ? undefined : valueOf(entity);
        }
        return todayPeak(this.points, valueOf(entity), Date.now(), this.hass?.config?.time_zone);
    }

    /**
     * The days from the recorder, today's peak in place of the statistics that reach only to the last full hour. A
     * sensor without statistics has no days at all, and today's peak alone would pass for the peak of a week.
     */
    private liveDays(peak: number | null | undefined): DayPeak[] | undefined {
        if (!this.days || this.days.every((day) => day.peak === null) || peak === undefined) {
            return this.days;
        }
        // Just after midnight, until the recorder is asked again, the last day on record is yesterday.
        const last = this.days[this.days.length - 1];
        if (last.day !== this.today()) {
            return this.days;
        }
        const known = [peak, last.peak].filter((value): value is number => value !== null);
        return [...this.days.slice(0, -1), { ...last, peak: known.length === 0 ? null : Math.max(...known) }];
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.config) {
            return nothing;
        }
        const config = this.config;
        const entity = this.hass.states[config.entity];
        if (!entity) {
            return html`<ha-card><div class="missing">${this.text("common.no_entity")} ${config.entity}</div></ha-card>`;
        }

        const language = this.language();
        const precision = precisionOf(this.hass, config.entity);
        const value = valueOf(entity);
        const level = levelOf(shownValue(value, precision));
        const now = indexText(value, language, precision);
        const peak = this.peakToday(entity);
        const peakText = peak === undefined ? NO_VALUE : indexText(peak, language, precision);
        const days = this.liveDays(peak);
        const showLevel = level !== null && option(config, "show_level");
        const levelText = level ? this.text(`level.${level}`) : "";
        const advice = option(config, "show_advice") ? adviceOf(level) : null;
        const adviceText = advice ? this.text(`advice.${advice}`) : "";
        const tappable = isTappable(config);

        return html`
            <ha-card
                class=${tappable ? "tappable" : ""}
                style=${this.colours()}
                role=${tappable ? "button" : nothing}
                tabindex=${tappable ? "0" : nothing}
                aria-label=${[
                    `${this.text("common.index")} ${now}`,
                    showLevel ? levelText : "",
                    `${this.text("common.peak")} ${peakText}`,
                    adviceText,
                ]
                    .filter(Boolean)
                    .join(", ")}
                @pointerdown=${() => this.gestures.pointerDown()}
                @pointerup=${() => this.gestures.pointerUp()}
                @pointercancel=${() => this.gestures.pointerUp()}
                @pointerleave=${() => this.gestures.pointerUp()}
                @click=${() => this.gestures.click()}
                @keydown=${(event: KeyboardEvent) => this.gestures.key(event)}
            >
                <div class="content">
                    <div class="gauge">
                        <div class="sun">
                            <svg viewBox="0 0 ${SUN_SIZE} ${SUN_SIZE}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                                ${sun({ value: shownValue(value, precision), glowing: value !== null && value > 0 && option(config, "animate_sun") })}
                            </svg>
                        </div>
                        <div class="figures">
                            <div class="figure now">
                                <span class="label"
                                    ><span class="long">${this.text("common.index")}</span
                                    ><span class="brief">${this.text("common.index_short")}</span></span
                                >
                                <span class="value">${now}${showLevel && level ? this.levelBars(level, levelText) : nothing}</span>
                                ${showLevel && level ? html`<span class="level" style="--level-color: ${colourOf(level)}">${levelText}</span>` : nothing}
                            </div>
                            <div class="figure peak">
                                <span class="label">${this.text("common.peak")}</span>
                                <span class="value"><span class="inline-label">${this.text("common.peak_short")} </span>${peakText}</span>
                            </div>
                        </div>
                    </div>
                    ${
                        advice && level
                            ? html`<div class="advice"><span class="dot" style="background: ${colourOf(level)}"></span>${adviceText}</div>`
                            : nothing
                    }
                    ${this.extras(days, language, precision)} ${this.dailyChart(days, language, precision)}
                    ${this.hourlyChart(entity, language, precision)}
                </div>
            </ha-card>
        `;
    }

    /** Five bars of rising height, one for each level, as many lit as the level reaches, each in its colour. */
    private levelBars(level: Level, text: string): TemplateResult {
        const reached = LEVELS.indexOf(level);
        return html`<span class="levels" title=${text} role="img" aria-label=${text}
            >${LEVELS.map((each, index) => html`<i style=${index <= reached ? `background: ${colourOf(each)}` : ""}></i>`)}</span
        >`;
    }

    /** The highest index of yesterday, and of the last 7 and 30 days, as the options ask. */
    private extras(days: DayPeak[] | undefined, language: string, precision?: number): TemplateResult | typeof nothing {
        const config = this.config;
        if (!config || !days) {
            return nothing;
        }
        // Each peak has a long name and a short one for the narrowest card.
        const wanted: Array<[string, number | null]> = [];
        if (option(config, "show_yesterday")) {
            wanted.push(["yesterday", days.length >= 2 ? days[days.length - 2].peak : null]);
        }
        if (option(config, "show_week")) {
            wanted.push(["week", peakOf(days, WEEK_DAYS)]);
        }
        if (option(config, "show_month")) {
            wanted.push(["month", peakOf(days, LOOKBACK_DAYS)]);
        }
        if (wanted.length === 0) {
            return nothing;
        }
        return html`<div class="extras">
            ${wanted.map(
                ([name, peak]) =>
                    html`<span class="extra"
                        ><span class="label"
                            ><span class="long">${this.text(`common.${name}`)}</span
                            ><span class="brief">${this.text(`common.${name}_short`)}</span></span
                        >
                        <span class="amount">${indexText(peak, language, precision)}</span></span
                    >`,
            )}
        </div>`;
    }

    private dailyChart(days: DayPeak[] | undefined, language: string, precision?: number): TemplateResult | typeof nothing {
        const config = this.config;
        if (!config || !option(config, "show_daily_chart") || !days) {
            return nothing;
        }
        const count = this.chartDays();
        const date = new Intl.DateTimeFormat(language, {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            timeZone: this.hass?.config?.time_zone,
        });
        const items: ChartItem[] = days.slice(-count).map((day) => ({
            time: day.time,
            value: day.peak,
            colour: colourOf(levelOf(shownValue(day.peak, precision)) ?? "low"),
            label: `${date.format(day.time)}: ${indexText(day.peak, language, precision)}`,
        }));
        return html`<compact-uv-index-chart
            class="chart daily-chart"
            kind="bars"
            .items=${items}
            .floor=${CHART_FLOOR}
            .heading=${this.text("common.daily_chart", { days: String(count) })}
            .brief=${this.text("common.daily_chart_short", { days: String(count) })}
        ></compact-uv-index-chart>`;
    }

    private hourlyChart(entity: HassEntity, language: string, precision?: number): TemplateResult | typeof nothing {
        const config = this.config;
        if (!config || !option(config, "show_hourly_chart") || !this.points) {
            return nothing;
        }
        const hours = this.chartHours();
        const end = Date.now();
        const start = end - hours * HOUR;
        // A reading from before the chart's start holds until the next one, so the chart starts with it. Home
        // Assistant's answer begins with the state in force at the start of what was asked for, which is earlier.
        const points = this.points.filter((point, index, all) => point.time >= start || (all[index + 1]?.time ?? end) > start);
        // What the sensor has said since the last fetch comes from its own state.
        const live = valueOf(entity);
        if (live !== null) {
            points.push({ time: end, value: live });
        }
        const time = new Intl.DateTimeFormat(language, {
            hour: "numeric",
            minute: "2-digit",
            ...(hours > 24 ? { weekday: "short" } : {}),
            timeZone: this.hass?.config?.time_zone,
        });
        const items: ChartItem[] = points.map((point) => ({
            time: Math.max(point.time, start),
            value: point.value,
            colour: colourOf(levelOf(shownValue(point.value, precision)) ?? "low"),
            label: `${time.format(point.time)}: ${indexText(point.value, language, precision)}`,
        }));
        return html`<compact-uv-index-chart
            class="chart hourly-chart"
            kind="line"
            .items=${items}
            .start=${start}
            .end=${end}
            .floor=${CHART_FLOOR}
            .heading=${this.text("common.hourly_chart", { hours: String(hours) })}
            .brief=${this.text("common.hourly_chart_short", { hours: String(hours) })}
        ></compact-uv-index-chart>`;
    }

    /** The outline's colour given in the configuration; without it the card follows the theme. */
    private colours(): string {
        return this.config?.border_colour ? `--uv-index-outline-color: ${this.config.border_colour}` : "";
    }

    private act(gesture: Gesture): void {
        this.dispatchEvent(
            new CustomEvent("hass-action", {
                detail: { config: this.config, action: gesture },
                bubbles: true,
                composed: true,
            }),
        );
    }

    private text(key: string, values: Record<string, string> = {}): string {
        return Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, value), translate(this.language(), key));
    }

    private language(): string {
        return this.config?.language || this.hass?.locale?.language || this.hass?.language || browserLanguage();
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                height: 100%;
            }

            ha-card {
                display: block;
                height: 100%;
                box-sizing: border-box;
                overflow: hidden;
                container: gauge / inline-size;
            }

            ha-card.tappable {
                cursor: pointer;
            }

            ha-card:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: -2px;
            }

            .content {
                display: flex;
                flex-direction: column;
                height: 100%;
                overflow: hidden;
            }

            .gauge {
                flex: 1 1 auto;
                display: flex;
                align-items: stretch;
                gap: 12px;
                min-height: 56px;
                padding: 8px 14px 8px 10px;
                box-sizing: border-box;
            }

            /*
             * As tall as the gauge and as wide as that height, unless the figures need the room. The drawing is laid
             * over the box rather than in it, so it never makes the gauge taller: the grid, or the figures, decide
             * the height.
             */
            .sun {
                flex: 0 1 auto;
                position: relative;
                width: var(--sun-width, 64px);
                min-width: 24px;
                max-width: 45%;
                min-height: 36px;
            }

            .sun svg {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                overflow: visible;
            }

            .ray {
                stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
                stroke-width: 4px;
                stroke-linecap: round;
                transition: stroke 0.6s ease;
            }

            .glow {
                animation: glow 3s ease-in-out infinite;
            }

            /* A slow breath rather than a blink, so the rays still read as lit at every moment. */
            @keyframes glow {
                50% {
                    opacity: 0.75;
                }
            }

            .disc {
                fill: none;
                stroke: var(--uv-index-outline-color, var(--secondary-text-color));
                stroke-width: 2.5px;
                transition: fill 0.6s ease;
            }

            /* Never narrower than the figures themselves, which are never cut short: the sun gives way instead. */
            .figures {
                flex: 1 0 auto;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
            }

            .figure {
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            .label,
            .value {
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /* A label takes the width the figures have but asks for none, so it is the one cut short. */
            .figure .label {
                width: 0;
                min-width: 100%;
            }

            .label {
                font-size: 12px;
                line-height: 16px;
                color: var(--secondary-text-color);
            }

            .value {
                font-size: 16px;
                line-height: 20px;
                font-weight: 500;
                color: var(--primary-text-color);
            }

            .inline-label {
                display: none;
            }

            /*
             * The level's name in its colour, mixed with the text colour so that yellow stays readable on a light
             * theme and doesn't glare on a dark one.
             */
            .level {
                font-size: 12px;
                line-height: 16px;
                font-weight: 500;
                color: color-mix(in srgb, var(--level-color) 70%, var(--primary-text-color));
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /*
             * The bars stand on the text's baseline and reach the top of its digits, whatever the font: an inline
             * flex box sits on the baseline, and a cap is the height of a capital or a digit.
             */
            .levels {
                display: inline-flex;
                align-items: flex-end;
                vertical-align: baseline;
                gap: 2px;
                height: 0.7em;
                height: 1cap;
                margin-left: 6px;
            }

            .levels i {
                display: block;
                width: 3px;
                border-radius: 1px;
                background: var(--divider-color, rgba(127, 127, 127, 0.3));
            }

            .levels i:nth-child(1) {
                height: 30%;
            }
            .levels i:nth-child(2) {
                height: 47%;
            }
            .levels i:nth-child(3) {
                height: 65%;
            }
            .levels i:nth-child(4) {
                height: 82%;
            }
            .levels i:nth-child(5) {
                height: 100%;
            }

            .advice {
                flex: none;
                display: flex;
                align-items: baseline;
                gap: 8px;
                margin: 0 10px 8px;
                padding: 0 4px;
                font-size: 12px;
                line-height: 16px;
                color: var(--secondary-text-color);
            }

            .advice .dot {
                flex: none;
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            /*
             * The parts under the sun are tiles of their own, as the packages are in package-tracker-card: the
             * peaks, and each chart with its heading under it.
             */
            .extras,
            .chart {
                flex: none;
                margin: 0 10px 8px;
                padding: 6px 10px;
                border-radius: 8px;
                background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
            }

            /* The peaks in equal columns, each its name over its value, with a thin line between them. */
            .extras {
                display: grid;
                grid-auto-columns: minmax(0, 1fr);
                grid-auto-flow: column;
                column-gap: 21px;
                line-height: 16px;
            }

            .extra {
                position: relative;
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            /* The line sits in the middle of the gap, so that every column is as wide as the others. */
            .extra + .extra::before {
                content: "";
                position: absolute;
                top: 0;
                bottom: 0;
                left: -11px;
                border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
            }

            .extra .label {
                font-size: 11px;
            }

            .extra .amount {
                font-size: 13px;
                font-weight: 500;
                color: var(--primary-text-color);
            }

            .chart {
                padding-top: 8px;
            }

            .content.hide-advice .advice,
            .content.hide-extras .extras,
            .content.hide-daily-chart .daily-chart,
            .content.hide-hourly-chart .hourly-chart {
                display: none;
            }

            .missing {
                padding: 12px 16px;
                color: var(--error-color);
            }

            /* The short names are for the narrowest card. */
            .brief {
                display: none;
            }

            /* Beside the sun but with little room: the index's own label gets short too. */
            @container gauge (max-width: 229px) {
                .now .long {
                    display: none;
                }
                .now .brief {
                    display: inline;
                }
            }

            /* Too narrow for the peaks side by side: one a row, the name left and the value right. */
            @container gauge (max-width: 299px) {
                .extras {
                    grid-auto-flow: row;
                }
                .extra {
                    flex-direction: row;
                    justify-content: space-between;
                    gap: 8px;
                }
                .extra + .extra::before {
                    display: none;
                }
                .extra .label {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .extra .amount {
                    flex: none;
                    white-space: nowrap;
                }
            }

            /* Room to spare: larger figures. */
            @container gauge (min-width: 260px) {
                .gauge {
                    gap: 16px;
                    padding: 10px 18px 10px 14px;
                }
                .figure .label {
                    font-size: 14px;
                    line-height: 18px;
                }
                .value {
                    font-size: 22px;
                    line-height: 28px;
                }
                .level {
                    font-size: 13px;
                    line-height: 17px;
                }
                .advice {
                    margin: 0 14px 10px;
                    font-size: 13px;
                    line-height: 17px;
                }
                .extras,
                .chart {
                    margin: 0 14px 10px;
                    padding-left: 12px;
                    padding-right: 12px;
                }
            }

            /* Narrow: the sun above the figures, without their labels. */
            @container gauge (max-width: 179px) {
                .gauge {
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 6px;
                }
                .sun {
                    flex: 1 1 auto;
                    width: 100%;
                    max-width: 100%;
                    min-height: 44px;
                }
                .figures {
                    flex: none;
                    align-items: center;
                    gap: 0;
                    max-width: 100%;
                }
                .figure {
                    align-items: center;
                    max-width: 100%;
                }
                .figure .label,
                .long {
                    display: none;
                }
                .brief,
                .inline-label {
                    display: inline;
                }
                .value {
                    font-size: 14px;
                    line-height: 18px;
                }
                .peak .value {
                    font-size: 12px;
                    line-height: 16px;
                    font-weight: 400;
                    color: var(--secondary-text-color);
                }
                .advice {
                    margin: 0 6px 6px;
                    padding: 0;
                    font-size: 11px;
                    line-height: 14px;
                }
                .extras,
                .chart {
                    margin: 0 4px 4px;
                    padding-left: 6px;
                    padding-right: 6px;
                }
                .extra {
                    gap: 4px;
                }
                .extra .amount {
                    font-size: 12px;
                }
            }

            /*
             * Low, such as one row of a sections view: the sun beside the figures whatever the width, and the
             * figures without labels, today's peak under the index with a short label of its own. Without one it
             * would be a second bare number, and an index has no unit to tell the two apart.
             */
            .gauge.short {
                flex-direction: row;
                align-items: stretch;
                gap: 8px;
                padding: 6px 10px 6px 8px;
            }
            .gauge.short .sun {
                flex: 0 1 auto;
                width: var(--sun-width, 34px);
                min-width: 16px;
                min-height: 0;
            }
            .gauge.short .figures {
                align-items: stretch;
                gap: 0;
            }
            .gauge.short .figure {
                align-items: flex-start;
            }
            .gauge.short .label,
            .gauge.short .level {
                display: none;
            }
            .gauge.short .inline-label {
                display: inline;
            }
            .gauge.short .value {
                font-size: 15px;
                line-height: 19px;
            }
            .gauge.short .peak .value {
                font-size: 12px;
                line-height: 16px;
                font-weight: 400;
                color: var(--secondary-text-color);
            }

            /* Both low and narrow, the smallest a sections view allows: a little smaller still. */
            @container gauge (max-width: 179px) {
                .gauge.short {
                    gap: 6px;
                    padding: 6px 8px 6px 6px;
                }
                .gauge.short .value {
                    font-size: 13px;
                }
                .gauge.short .peak .value {
                    font-size: 11px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .ray,
                .disc {
                    transition: none;
                }
                .glow {
                    animation: none;
                }
            }
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "compact-uv-index-card": CompactUvIndexCard;
    }
}
