/**
 * The sun: a disc in the colour of the current level, and twelve rays around it, one for each step of the index.
 * As many rays are lit as the rounded index, each in the colour of its own step's level, so the rays are the
 * card's scale as well as its reading. From 12 on all of them are lit.
 *
 * It is drawn in a 100 × 100 box. While the sun is up, the lit rays can glow.
 */
import { svg } from "lit";
import type { TemplateResult } from "lit";

import { colourOf, levelOf, roundedIndex } from "./levels";

export const SUN_SIZE = 100;
export const RAYS = 12;
const CENTRE = 50;
const DISC = 22;
const RAY_START = 31;
const RAY_END = 43;
/** Every third ray, for steps 3, 6, 9 and 12, is a little longer, for reading the scale at a glance. */
const LONG_RAY_END = 47;

/** How many rays are lit for an index. */
export function litRays(value: number | null): number {
    return value === null ? 0 : Math.min(roundedIndex(value), RAYS);
}

export interface SunOptions {
    /** The index now, or nothing while the sensor is unavailable. */
    value: number | null;
    /** Lets the lit rays glow. */
    glowing: boolean;
}

export function sun({ value, glowing }: SunOptions): TemplateResult {
    const lit = litRays(value);
    const level = levelOf(value);
    // The disc is filled while the sun is up at all, even below the first step, and left empty at night.
    const up = value !== null && value > 0 && level !== null;
    return svg`
    ${Array.from({ length: RAYS }, (_, ray) => {
        const step = ray + 1;
        // As on a clock face: step 1 at one o'clock and step 12 at the top, the long rays on the quarters.
        const angle = (step / RAYS) * 2 * Math.PI - Math.PI / 2;
        const end = step % 3 === 0 ? LONG_RAY_END : RAY_END;
        const on = step <= lit;
        const stepLevel = levelOf(step);
        return svg`<line class=${on ? (glowing ? "ray on glow" : "ray on") : "ray"}
          x1=${CENTRE + Math.cos(angle) * RAY_START} y1=${CENTRE + Math.sin(angle) * RAY_START}
          x2=${CENTRE + Math.cos(angle) * end} y2=${CENTRE + Math.sin(angle) * end}
          style=${on && stepLevel ? `stroke: ${colourOf(stepLevel)}; animation-delay: ${(ray * 0.25).toFixed(2)}s` : ""}></line>`;
    })}
    <circle class="disc" cx=${CENTRE} cy=${CENTRE} r=${DISC} style=${up ? `fill: ${colourOf(level)}` : ""}></circle>
  `;
}
