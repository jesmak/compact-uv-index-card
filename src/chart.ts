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
    @state() private active?: number;

    protected render(): TemplateResult {
        const values = this.items.map((item) => item.value ?? 0);
        const top = Math.max(this.floor, ...values);
        const active = this.active === undefined ? undefined : this.items[this.active];
        const x = active === undefined ? 0 : this.xOf(this.active ?? 0);
        return html`
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
            <div class="heading"><span class="long">${this.heading}</span><span class="brief">${this.brief || this.heading}</span></div>
        `;
    }

    private bars(top: number): TemplateResult {
        const slot = WIDTH / Math.max(this.items.length, 1);
        return svg`${this.items.map((item, index) => {
            const height = item.value ? Math.max((item.value / top) * (HEIGHT - TOP), 0.8) : 0;
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
        const y = (value: number) => HEIGHT - (value / top) * (HEIGHT - TOP);
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
            .plot {
                position: relative;
                height: 30px;
                margin-bottom: 2px;
                touch-action: pan-y;
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
