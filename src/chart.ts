/**
 * A small chart under the sun: each day's highest index as bars, or the index over the last hours as a line,
 * both in the colours of their levels. Pointing at it, or touching it, shows a bubble with the value there.
 * Touching a chart doesn't open the card's action, so it can be read on a phone.
 */
import { LitElement, css, html, nothing, svg } from "lit";
import type { CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface ChartItem {
    time: number;
    value: number | null;
    /** The colour of its level. */
    colour: string;
    /** What the bubble says about it: its date or time, and its value. */
    label: string;
}

const WIDTH = 100;
const HEIGHT = 32;
/** Room above the highest value, so a peak doesn't touch the top. */
const TOP = 2;
/** The plot's height in pixels, as in the styles below. */
const PLOT_HEIGHT = 30;
/** The WHO's steps, which get marker lines as many as fit, the lowest first as it matters most. */
export const MARKS = [3, 6, 8, 11];
/** The least room in pixels between two marker lines, and between the lowest and the baseline, so their values fit. */
const MARK_GAP = 10;
const BASELINE_GAP = 5;

@customElement("compact-uv-index-chart")
export class CompactUvIndexChart extends LitElement {
    @property() public kind: "bars" | "line" = "bars";
    @property({ attribute: false }) public items: ChartItem[] = [];
    /** The time span of a line chart; bars take one slot each. */
    @property({ type: Number }) public start = 0;
    @property({ type: Number }) public end = 0;
    /** The least the chart's top stands for, so a dull day draws low rather than filling the chart. */
    @property({ type: Number }) public floor = 1;
    @property() public heading = "";
    /** A shorter heading for a chart too narrow for the long one. */
    @property() public brief = "";
    /** The language the marker lines' values are written in. */
    @property() public language = "en";
    @state() private active?: number;

    protected render(): TemplateResult {
        const values = this.items.map((item) => item.value ?? 0);
        const top = Math.max(this.floor, ...values);
        const active = this.active === undefined ? undefined : this.items[this.active];
        const x = active === undefined ? 0 : this.xOf(this.active ?? 0);
        const steps = stepsShown(top);
        const number = new Intl.NumberFormat(this.language);
        const y = (value: number) => HEIGHT - heightOf(value, top);
        return html`
            <div class="frame">
                ${
                    steps.length === 0
                        ? nothing
                        : html`<div class="axis">
                              ${steps.map((step) => html`<span class="sizer">${number.format(step)}</span>`)}
                              ${steps.map(
                                  (step) =>
                                      html`<span class="value" style="top: ${(y(lineOf(step)) / HEIGHT) * 100}%"
                                          >${number.format(step)}</span
                                      >`,
                              )}
                          </div>`
                }
                <div
                    class="plot"
                    @pointermove=${this.point}
                    @pointerdown=${(event: PointerEvent) => {
                        event.stopPropagation();
                        this.point(event);
                    }}
                    @pointerleave=${() => (this.active = undefined)}
                    @click=${(event: Event) => event.stopPropagation()}
                >
                    <svg viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="none" aria-hidden="true">
                        ${steps.map((step) => svg`<line class="mark" x1="0" x2=${WIDTH} y1=${y(lineOf(step))} y2=${y(lineOf(step))}></line>`)}
                        <line class="baseline" x1="0" x2=${WIDTH} y1=${HEIGHT} y2=${HEIGHT}></line>
                        ${this.kind === "bars" ? this.bars(top) : this.line(top)}
                        ${
                            active === undefined || this.kind === "bars"
                                ? nothing
                                : svg`<line class="cursor" x1=${x} x2=${x} y1="0" y2=${HEIGHT}></line>`
                        }
                    </svg>
                    ${
                        active === undefined
                            ? nothing
                            : html`<div class="bubble" style="left: ${x}%; transform: translateX(-${x}%)">${active.label}</div>`
                    }
                </div>
            </div>
            <div class="heading"><span class="long">${this.heading}</span><span class="brief">${this.brief || this.heading}</span></div>
        `;
    }

    private bars(top: number): TemplateResult {
        const slot = WIDTH / Math.max(this.items.length, 1);
        return svg`${this.items.map((item, index) => {
            const height = item.value ? Math.max(heightOf(item.value, top), 0.8) : 0;
            return svg`<rect class=${index === this.active ? "bar active" : "bar"} x=${index * slot + slot * 0.15}
        y=${HEIGHT - height} width=${slot * 0.7} height=${height} style="fill: ${item.colour}"></rect>`;
        })}`;
    }

    /** A line from reading to reading, the index changing smoothly through the day, coloured by its levels. */
    private line(top: number): TemplateResult {
        const points = this.items.filter((item) => item.value !== null);
        if (points.length === 0) {
            return svg``;
        }
        const y = (value: number) => HEIGHT - heightOf(value, top);
        const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${this.xAt(point.time)} ${y(point.value ?? 0)}`).join(" ");
        // A gradient across the chart's width, its colour at each reading's place, colours the line by level.
        const stops = points.map((point) => svg`<stop offset=${this.xAt(point.time) / WIDTH} style="stop-color: ${point.colour}"></stop>`);
        return svg`<defs><linearGradient id="levels" gradientUnits="userSpaceOnUse" x1="0" x2=${WIDTH} y1="0" y2="0"
        >${stops}</linearGradient></defs><path class="stroke" d=${points.length === 1 ? `${path} H${WIDTH}` : path}></path>`;
    }

    private xAt(time: number): number {
        const span = this.end - this.start;
        return span > 0 ? Math.min(Math.max(((time - this.start) / span) * WIDTH, 0), WIDTH) : 0;
    }

    private xOf(index: number): number {
        if (this.kind === "bars") {
            const slot = WIDTH / Math.max(this.items.length, 1);
            return index * slot + slot / 2;
        }
        return this.xAt(this.items[index].time);
    }

    /** The item under the pointer: the bar in its slot, or the latest reading at that moment of the line. */
    private point(event: PointerEvent): void {
        const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
        if (box.width <= 0 || this.items.length === 0) {
            return;
        }
        const share = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 0.9999);
        this.active = indexAt(this.kind, this.items, share, this.start, this.end);
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                container: chart / inline-size;
            }
            .heading {
                font-size: 11px;
                line-height: 14px;
                color: var(--secondary-text-color);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .brief {
                display: none;
            }
            .frame {
                display: flex;
                align-items: flex-start;
                margin-bottom: 2px;
            }
            .plot {
                position: relative;
                flex: 1;
                min-width: 0;
                height: 30px;
                touch-action: pan-y;
            }
            .axis {
                position: relative;
                height: 30px;
                margin-right: 4px;
                font-size: 9px;
                line-height: 9px;
                color: var(--secondary-text-color);
                font-variant-numeric: tabular-nums;
            }
            /* The values, unseen and on no line, give the axis the width of the widest. */
            .sizer {
                display: block;
                height: 0;
                overflow: hidden;
                visibility: hidden;
            }
            .value {
                position: absolute;
                right: 0;
                transform: translateY(-50%);
                white-space: nowrap;
            }
            .mark {
                stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
                stroke-width: 1px;
                stroke-dasharray: 2 3;
                vector-effect: non-scaling-stroke;
            }
            svg {
                display: block;
                width: 100%;
                height: 100%;
                overflow: visible;
            }
            .bar {
                opacity: 0.8;
            }
            .bar.active {
                opacity: 1;
            }
            .stroke {
                fill: none;
                stroke: url(#levels);
                stroke-width: 2px;
                stroke-linejoin: round;
                vector-effect: non-scaling-stroke;
            }
            .baseline {
                stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
                stroke-width: 1px;
                vector-effect: non-scaling-stroke;
            }
            .cursor {
                stroke: var(--secondary-text-color);
                stroke-width: 1px;
                vector-effect: non-scaling-stroke;
            }
            .bubble {
                position: absolute;
                bottom: calc(100% + 4px);
                padding: 2px 6px;
                border-radius: 6px;
                background: var(--primary-text-color);
                color: var(--card-background-color, var(--ha-card-background, #fff));
                font-size: 11px;
                line-height: 16px;
                white-space: nowrap;
                pointer-events: none;
                z-index: 1;
            }

            /* The narrow overrides come last, so that they win over the rules above. */

            /* In the narrowest cards, three or four columns of a section: the short heading, a little smaller. */
            @container chart (max-width: 130px) {
                .heading {
                    font-size: 10px;
                }
                .long {
                    display: none;
                }
                .brief {
                    display: inline;
                }
            }

            /* The narrowest of all: the heading may take two lines rather than lose its period. */
            @container chart (max-width: 100px) {
                .heading {
                    white-space: normal;
                }
            }
        `;
    }
}

/** How high a value stands in the chart, in its units, when the chart's top stands for `top`. */
function heightOf(value: number, top: number): number {
    return (value / top) * (HEIGHT - TOP);
}

/** Where a step's line is drawn: where its colour starts, as the levels go by the index rounded to a whole number. */
export function lineOf(step: number): number {
    return step - 0.5;
}

/** The WHO's steps whose lines a chart with this top has room for. */
export function stepsShown(top: number): number[] {
    const lines = marksUnder(top, MARKS.map(lineOf));
    return MARKS.filter((step) => lines.includes(lineOf(step)));
}

/**
 * The values to draw marker lines at, lowest first: the candidates, taken in order of preference, that the chart
 * reaches, leaving out any too close to the baseline or to a line already kept for their values to fit.
 */
export function marksUnder(top: number, candidates: number[]): number[] {
    const pixels = (value: number) => heightOf(value, top) * (PLOT_HEIGHT / HEIGHT);
    const marks: number[] = [];
    for (const value of candidates) {
        const clear = marks.every((mark) => Math.abs(pixels(value) - pixels(mark)) >= MARK_GAP);
        if (value <= top && pixels(value) >= BASELINE_GAP && clear) {
            marks.push(value);
        }
    }
    return marks.sort((a, b) => a - b);
}

/** Which item a share of the chart's width points at. */
export function indexAt(kind: "bars" | "line", items: ChartItem[], share: number, start: number, end: number): number {
    if (kind === "bars") {
        return Math.min(Math.floor(share * items.length), items.length - 1);
    }
    const time = start + share * (end - start);
    let found = 0;
    items.forEach((item, index) => {
        if (item.time <= time) {
            found = index;
        }
    });
    return found;
}

declare global {
    interface HTMLElementTagNameMap {
        "compact-uv-index-chart": CompactUvIndexChart;
    }
}
