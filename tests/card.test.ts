import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fitCard } from "../src/compact-uv-index-card";
import type { CompactUvIndexCard } from "../src/compact-uv-index-card";
import type { CompactUvIndexCardEditor } from "../src/editor";
import type { HomeAssistant } from "../src/hass";
import type { CompactUvIndexCardConfig } from "../src/types";

const UV = "sensor.example_uv_index";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** What the recorder answers: the peak of each of the last days, and the readings of the last hours. */
interface Recorder {
    /** A day's peak, or null for a day the statistics have no hours of. */
    days?: Array<number | null>;
    points?: Array<[number, number]>;
    calls?: Array<Record<string, unknown>>;
}

function recorder({ days = [], points = [], calls = [] }: Recorder) {
    return async <T>(message: Record<string, unknown>): Promise<T> => {
        calls.push(message);
        const now = Date.now();
        if (message.type === "recorder/statistics_during_period") {
            // days[0] is today, days[1] yesterday, and so on.
            return { [UV]: days.map((max, ago) => ({ start: now - ago * DAY, max })) } as T;
        }
        // Like Home Assistant, the answer starts with the state in force at the start, stamped with the start's time.
        const start = Date.parse(String(message.start_time));
        const rows = points
            .map(([hoursAgo, value]) => ({ time: now - hoursAgo * HOUR, value }))
            .sort((one, other) => one.time - other.time);
        const before = rows.filter((row) => row.time < start).pop();
        const inside = rows.filter((row) => row.time >= start);
        const answer = [...(before ? [{ ...before, time: start }] : []), ...inside];
        return { [UV]: answer.map((row) => ({ s: String(row.value), lu: row.time / 1000 })) } as T;
    };
}

async function settled(element: CompactUvIndexCard): Promise<void> {
    await element.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 0));
    await element.updateComplete;
}

function hass(uv = "5.4", language = "en", history: Recorder = {}): HomeAssistant {
    return {
        locale: { language },
        states: { [UV]: { entity_id: UV, state: uv, last_changed: "2026-06-22", attributes: { unit_of_measurement: "UV index" } } },
        callWS: recorder(history),
    };
}

async function card(state: HomeAssistant, config: Partial<CompactUvIndexCardConfig> = {}): Promise<CompactUvIndexCard> {
    const element = document.createElement("compact-uv-index-card") as CompactUvIndexCard;
    element.setConfig({ type: "custom:compact-uv-index-card", entity: UV, ...config } as never);
    element.hass = state;
    document.body.append(element);
    await element.updateComplete;
    return element;
}

function root(element: CompactUvIndexCard): ShadowRoot {
    if (!element.shadowRoot) {
        throw new Error("the card rendered nothing");
    }
    return element.shadowRoot;
}

/** The figures' values, without the short label that only a low card shows. */
function texts(element: CompactUvIndexCard): string[] {
    return [...root(element).querySelectorAll(".value")].map((node) => {
        const copy = node.cloneNode(true) as HTMLElement;
        copy.querySelector(".inline-label")?.remove();
        return copy.textContent?.trim() ?? "";
    });
}

let content: HTMLElement;
/** How many parts the fitting has left out so far. */
const hidden = () => [...content.classList].filter((name) => name.startsWith("hide-")).length;

/**
 * A card's inside with made-up sizes: the card's height, the content's, the height the figures get, and the
 * height their labels need.
 */
function layout(sizes: { card: number; content: () => number; figures?: () => number; need?: number; gauge?: number }): {
    content: HTMLElement;
    gauge: HTMLElement;
} {
    content = document.createElement("div");
    const gauge = document.createElement("div");
    gauge.className = "gauge";
    const figures = document.createElement("div");
    figures.className = "figures";
    gauge.append(figures);
    content.append(gauge);
    // Styles are only computed for what is in the document.
    document.body.append(content);
    const box = (element: HTMLElement, client: () => number, scroll: () => number) => {
        Object.defineProperty(element, "clientHeight", { get: client, configurable: true });
        Object.defineProperty(element, "scrollHeight", { get: scroll, configurable: true });
    };
    const given = sizes.figures ?? (() => 76);
    const need = () => (gauge.classList.contains("short") ? 36 : (sizes.need ?? 76));
    box(content, () => sizes.card, sizes.content);
    box(
        gauge,
        () => sizes.gauge ?? given(),
        () => sizes.gauge ?? given(),
    );
    box(figures, given, () => Math.max(need(), given()));
    return { content, gauge };
}

beforeEach(() => {
    document.body.innerHTML = "";
    // Midsummer noon, so that the readings of the last hours are today's whenever the tests run.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 5, 22, 12, 0));
});

afterEach(() => {
    vi.useRealTimers();
});

describe("the gauge", () => {
    it("shows the index, its level and today's peak, with their labels", async () => {
        const element = await card(
            hass("5.4", "en", {
                points: [
                    [3, 2.5],
                    [1, 6.1],
                ],
            }),
        );
        await settled(element);
        expect(texts(element)).toEqual(["5.4", "6.1"]);
        expect(root(element).querySelector(".level")?.textContent).toBe("Moderate");
        const labels = [...root(element).querySelectorAll(".figure .label")].map(
            (node) => node.querySelector(".long")?.textContent ?? node.textContent,
        );
        expect(labels).toEqual(["UV index", "Today's peak"]);
    });

    it("shows a dash for today's peak until the readings are in", async () => {
        const element = await card(hass());
        expect(texts(element)).toEqual(["5.4", "—"]);
    });

    it("takes the live index as today's peak when it is the highest yet", async () => {
        const element = await card(hass("7.2", "en", { points: [[1, 6.1]] }));
        await settled(element);
        expect(texts(element)).toEqual(["7.2", "7.2"]);
    });

    it("shows dashes, no level and an empty sun while the sensor is unavailable", async () => {
        const element = await card(hass("unavailable"));
        await settled(element);
        expect(texts(element)).toEqual(["—", "—"]);
        expect(root(element).querySelector(".level")).toBeNull();
        expect(root(element).querySelectorAll(".ray.on")).toHaveLength(0);
        expect(root(element).querySelector(".disc")?.getAttribute("style")).toBe("");
    });

    it("takes its own language and outline colour", async () => {
        const element = await card(hass("5.4", "en"), { language: "fi", border_colour: "rgba(255,255,255,.1)" });
        const labels = [...root(element).querySelectorAll(".figure .label")].map(
            (node) => node.querySelector(".long")?.textContent ?? node.textContent,
        );
        expect(labels).toEqual(["UV-indeksi", "Huippu tänään"]);
        expect(root(element).querySelector(".level")?.textContent).toBe("Kohtalainen");
        expect(root(element).querySelector(".now .brief")?.textContent).toBe("UV");
        expect(texts(element)[0]).toBe("5,4");
        expect(root(element).querySelector("ha-card")?.getAttribute("style")).toContain("--uv-index-outline-color: rgba(255,255,255,.1)");
    });

    it("says so when the sensor isn't there", async () => {
        const element = await card(hass(), { entity: "sensor.gone" });
        expect(root(element).querySelector(".missing")?.textContent).toContain("sensor.gone");
    });

    it("refuses a configuration without a sensor", () => {
        const element = document.createElement("compact-uv-index-card") as CompactUvIndexCard;
        expect(() => element.setConfig({ type: "custom:compact-uv-index-card" } as never)).toThrow();
    });

    it("refuses a chart length that isn't a number, as the editor does", () => {
        const config = { type: "custom:compact-uv-index-card", entity: UV, hourly_chart_hours: "a day" } as never;
        const element = document.createElement("compact-uv-index-card") as CompactUvIndexCard;
        const form = document.createElement("compact-uv-index-card-editor") as CompactUvIndexCardEditor;
        expect(() => element.setConfig(config)).toThrow();
        expect(() => form.setConfig(config)).toThrow();
    });
});

describe("the sun", () => {
    it("lights a ray for each step of the rounded index, each in its own level's colour", async () => {
        const rays = [...root(await card(hass("5.4"))).querySelectorAll(".ray.on")];
        expect(rays).toHaveLength(5);
        expect(rays[0].getAttribute("style")).toContain("--uv-index-low-color");
        expect(rays[4].getAttribute("style")).toContain("--uv-index-moderate-color");
    });

    it("fills its disc with the level's colour while the sun is up, and leaves it empty at night", async () => {
        expect(
            root(await card(hass("8.2")))
                .querySelector(".disc")
                ?.getAttribute("style"),
        ).toContain("--uv-index-very-high-color");
        expect(
            root(await card(hass("0.2")))
                .querySelector(".disc")
                ?.getAttribute("style"),
        ).toContain("--uv-index-low-color");
        expect(
            root(await card(hass("0")))
                .querySelector(".disc")
                ?.getAttribute("style"),
        ).toBe("");
    });

    it("glows while the sun is up, unless told not to", async () => {
        expect(root(await card(hass("5.4"))).querySelectorAll(".glow")).toHaveLength(5);
        expect(root(await card(hass("5.4"), { animate_sun: false })).querySelectorAll(".glow")).toHaveLength(0);
        expect(root(await card(hass("0"))).querySelectorAll(".glow")).toHaveLength(0);
    });
});

describe("the level", () => {
    it("lights a bar for each level reached, unless told not to", async () => {
        const element = await card(hass("6.6"));
        const bars = root(element).querySelector(".levels");
        expect(bars?.getAttribute("title")).toBe("High");
        expect([...(bars?.querySelectorAll("i") ?? [])].filter((bar) => bar.getAttribute("style") !== "")).toHaveLength(3);
        const plain = await card(hass("6.6"), { show_level: false });
        expect(root(plain).querySelector(".levels")).toBeNull();
        expect(root(plain).querySelector(".level")).toBeNull();
    });

    it("says how to protect yourself from 3 on, unless told not to", async () => {
        const advice = async (uv: string, config: Partial<CompactUvIndexCardConfig> = {}) =>
            root(await card(hass(uv), config))
                .querySelector(".advice")
                ?.textContent?.trim();
        expect(await advice("2.4")).toBeUndefined();
        expect(await advice("2.6")).toContain("Protect yourself");
        expect(await advice("8.1")).toContain("Avoid the midday sun");
        expect(await advice("8.1", { show_advice: false })).toBeUndefined();
    });
});

describe("the size of the card", () => {
    it("asks for half a sections row width and three rows, and works down to a quarter and one row", async () => {
        expect((await card(hass())).getGridOptions()).toEqual({ columns: 6, rows: 3, min_columns: 3, min_rows: 1 });
    });

    it("asks for a row more for the peaks and for each chart", async () => {
        const element = await card(hass(), { show_daily_chart: true, show_hourly_chart: true });
        expect(element.getGridOptions().rows).toBe(5);
        element.setConfig({ type: "custom:compact-uv-index-card", entity: UV, show_week: true } as never);
        expect(element.getGridOptions().rows).toBe(4);
    });

    it("leaves out the hourly chart first, then the daily one, the peaks and the advice, until the rest fits", () => {
        const { content } = layout({ card: 200, content: () => 420 - hidden() * 60 });
        fitCard(content);
        expect([...content.classList]).toEqual(["hide-hourly-chart", "hide-daily-chart", "hide-extras", "hide-advice"]);
    });

    it("leaves out a part rather than squeeze the sun's figures out of their labels", () => {
        const { content, gauge } = layout({ card: 200, content: () => 200, figures: () => (hidden() > 0 ? 80 : 60) });
        fitCard(content);
        expect([...content.classList]).toEqual(["hide-hourly-chart"]);
        expect(gauge.classList.contains("short")).toBe(false);
    });

    it("drops the labels only when the card is too low for them", () => {
        const low = layout({ card: 56, content: () => 56, figures: () => 40, need: 76 });
        fitCard(low.content);
        expect(low.gauge.classList.contains("short")).toBe(true);

        const free = layout({ card: 60, content: () => 60, figures: () => 52, need: 52 });
        fitCard(free.content);
        expect(free.gauge.classList.contains("short")).toBe(false);
        expect(free.content.classList.length).toBe(0);
    });

    it("makes the sun as wide as the height it gets", () => {
        const { content, gauge } = layout({ card: 120, content: () => 120, figures: () => 104, gauge: 120 });
        gauge.style.paddingTop = "8px";
        gauge.style.paddingBottom = "8px";
        fitCard(content);
        expect(gauge.style.getPropertyValue("--sun-width")).toBe("104px");
    });

    it("measures its own width, so its layout follows the space it is given", () => {
        const styles = (customElements.get("compact-uv-index-card") as unknown as { styles: { cssText: string } }).styles.cssText;
        expect(styles).toContain("container: gauge / inline-size");
        expect(styles).toMatch(/@container gauge \(max-width: 179px\)/);
        expect(styles).toMatch(/@container gauge \(min-width: 260px\)/);
    });
});

describe("tapping, holding and double tapping", () => {
    let actions: string[];
    const listen = (element: CompactUvIndexCard) =>
        element.addEventListener("hass-action", (event) => {
            actions.push((event as CustomEvent<{ action: string }>).detail.action);
        });
    const cardOf = (element: CompactUvIndexCard) => root(element).querySelector("ha-card") as HTMLElement;

    beforeEach(() => {
        actions = [];
        vi.useFakeTimers();
    });

    it("hands a tap to Home Assistant at once, with the card configuration", async () => {
        const element = await card(hass());
        let detail: { config?: CompactUvIndexCardConfig } = {};
        element.addEventListener("hass-action", (event) => {
            detail = (event as CustomEvent).detail;
        });
        cardOf(element).click();
        expect(detail.config?.entity).toBe(UV);
    });

    it("is a button that the keyboard can press", async () => {
        const element = await card(hass());
        listen(element);
        const haCard = cardOf(element);
        expect(haCard.getAttribute("role")).toBe("button");
        expect(haCard.getAttribute("tabindex")).toBe("0");
        haCard.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        expect(actions).toEqual(["tap"]);
    });

    it("is no button when tapping does nothing", async () => {
        const haCard = cardOf(await card(hass(), { tap_action: { action: "none" } }));
        expect(haCard.hasAttribute("role")).toBe(false);
        expect(haCard.hasAttribute("tabindex")).toBe(false);
    });

    it("tells a hold from a tap when it has a hold action", async () => {
        const element = await card(hass(), { hold_action: { action: "more-info" } });
        listen(element);
        const haCard = cardOf(element);
        haCard.dispatchEvent(new Event("pointerdown"));
        vi.advanceTimersByTime(600);
        haCard.dispatchEvent(new Event("pointerup"));
        haCard.click();
        expect(actions).toEqual(["hold"]);
    });

    it("tells a double tap from two taps when it has a double tap action", async () => {
        const element = await card(hass(), { double_tap_action: { action: "toggle" } });
        listen(element);
        const haCard = cardOf(element);
        haCard.click();
        haCard.click();
        vi.advanceTimersByTime(300);
        expect(actions).toEqual(["double_tap"]);

        haCard.click();
        vi.advanceTimersByTime(300);
        expect(actions).toEqual(["double_tap", "tap"]);
    });
});

describe("what the recorder adds", () => {
    const thirtyDays = (peak: number) => Array.from({ length: 30 }, (_, ago) => (ago === 10 ? peak : ago === 3 ? 4.8 : 1));
    const extras = (element: CompactUvIndexCard) =>
        [...root(element).querySelectorAll(".extra")].map(
            (node) => `${node.querySelector(".long")?.textContent} ${node.querySelector(".amount")?.textContent}`,
        );

    it("shows the peak of yesterday and of the last 7 and 30 days, today's from today's readings", async () => {
        const element = await card(hass("5.4", "en", { days: thirtyDays(7.6), points: [[1, 6.1]] }), {
            show_yesterday: true,
            show_week: true,
            show_month: true,
        });
        await settled(element);
        // Today peaks at 6.1, three days ago at 4.8 and ten days ago at 7.6; the rest are 1.
        expect(extras(element)).toEqual(["Yesterday 1", "Past 7 days 6.1", "Past 30 days 7.6"]);
    });

    it("asks only for today's readings when no option needs the days", async () => {
        const calls: Array<Record<string, unknown>> = [];
        const element = await card(hass("5.4", "en", { calls }));
        await settled(element);
        expect(calls.map((call) => call.type)).toEqual(["history/history_during_period"]);
    });

    it("asks again after midnight rather than put today's peak on yesterday", async () => {
        const calls: Array<Record<string, unknown>> = [];
        const yesterday = (element: CompactUvIndexCard) => root(element).querySelector(".extra .amount")?.textContent;
        // Four minutes, well inside the refresh interval, so only the change of day can make it ask again.
        vi.setSystemTime(new Date(2026, 5, 22, 23, 58));
        const element = await card(hass("0", "en", { days: [6.2, 3], calls }), { show_yesterday: true });
        await settled(element);
        expect(yesterday(element)).toBe("3");
        vi.setSystemTime(new Date(2026, 5, 23, 0, 2));
        element.hass = hass("0", "en", { days: [0, 6.2], calls });
        await settled(element);
        expect(yesterday(element)).toBe("6.2");
        expect(calls).toHaveLength(4);
    });

    it("asks again when it comes back to the page after a while", async () => {
        const calls: Array<Record<string, unknown>> = [];
        const element = await card(hass("5.4", "en", { days: [5.4, 3], calls }), { show_yesterday: true });
        await settled(element);
        element.remove();
        vi.setSystemTime(new Date(2026, 5, 22, 12, 20));
        document.body.append(element);
        await settled(element);
        expect(calls).toHaveLength(4);
    });

    it("asks again for a configuration changed while it was asking", async () => {
        const calls: Array<Record<string, unknown>> = [];
        const element = await card(hass("5.4", "en", { days: [5.4, 4.2], calls }), { show_daily_chart: true });
        element.setConfig({ type: "custom:compact-uv-index-card", entity: UV, show_daily_chart: true, show_yesterday: true });
        await settled(element);
        await settled(element);
        expect(calls).toHaveLength(4);
        expect(root(element).querySelector(".extra .amount")?.textContent).toBe("4.2");
    });

    it("doesn't take a press on a chart for holding the card", async () => {
        const element = await card(hass("5.4", "en", { days: [5.4, 4.2] }), {
            show_daily_chart: true,
            hold_action: { action: "more-info" },
        });
        await settled(element);
        const actions: string[] = [];
        element.addEventListener("hass-action", (event) => actions.push((event as CustomEvent<{ action: string }>).detail.action));
        const plot = root(element).querySelector(".daily-chart")?.shadowRoot?.querySelector(".plot");
        vi.useFakeTimers();
        plot?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, clientX: 10 }));
        vi.advanceTimersByTime(600);
        expect(actions).toEqual([]);
    });

    it("draws the days as bars and the hours as a line, as long as asked, in their levels' colours", async () => {
        const element = await card(
            hass("5.4", "en", {
                days: thirtyDays(7.6),
                points: [
                    [30, 1],
                    [5, 3.2],
                    [2, 6.1],
                ],
            }),
            {
                show_daily_chart: true,
                daily_chart_days: 7,
                show_hourly_chart: true,
                hourly_chart_hours: 12,
            },
        );
        await settled(element);
        type Chart = HTMLElement & { items: Array<{ time: number; value: number; colour: string }>; heading: string };
        const daily = root(element).querySelector(".daily-chart") as Chart;
        const hourly = root(element).querySelector(".hourly-chart") as Chart;
        expect(daily.items).toHaveLength(7);
        expect(daily.heading).toBe("Daily peak, last 7 days");
        // Today's bar is today's peak, high, not the statistics' last full hour.
        expect(daily.items[6]).toMatchObject({ value: 6.1, colour: expect.stringContaining("--uv-index-high-color") });
        // The reading in force 12 hours ago starts the line at its start, then the readings since and the live index.
        expect(hourly.items.map((item) => item.value)).toEqual([1, 3.2, 6.1, 5.4]);
        expect(hourly.items[0].time).toBe(Date.now() - 12 * HOUR);
        expect(hourly.heading).toBe("UV index, last 12 h");
    });
});

describe("the charts' marker lines", () => {
    it("are written in the card's language", async () => {
        const element = await card(hass("5.4", "en", { days: [5.4, 4.2] }), {
            language: "fi",
            show_daily_chart: true,
            show_hourly_chart: true,
        });
        await settled(element);
        const charts = [...root(element).querySelectorAll(".chart")] as Array<HTMLElement & { language: string }>;
        expect(charts.map((chart) => chart.language)).toEqual(["fi", "fi"]);
    });
});

describe("the narrowest card", () => {
    it("has short names for the peaks and the charts beside the long ones", async () => {
        const element = await card(hass("5.4", "fi", { days: [1, 2, 3, 4, 5, 6, 7, 8] }), {
            show_yesterday: true,
            show_week: true,
            show_month: true,
            show_daily_chart: true,
            show_hourly_chart: true,
        });
        await settled(element);
        const names = (selector: string) => [...root(element).querySelectorAll(`.extra ${selector}`)].map((node) => node.textContent);
        expect(names(".long")).toEqual(["Eilen", "7 päivää", "30 päivää"]);
        expect(names(".brief")).toEqual(["1 pv", "7 pv", "30 pv"]);
        const daily = root(element).querySelector(".daily-chart") as HTMLElement & { brief: string };
        const hourly = root(element).querySelector(".hourly-chart") as HTMLElement & { brief: string };
        expect(daily.brief).toBe("Huippu, 14 pv");
        expect(hourly.brief).toBe("UV, 24 h");
        expect(root(element).querySelector(".peak .inline-label")?.textContent?.trim()).toBe("Huippu");
    });
});

describe("the review's cases", () => {
    it("reads the level and the rays from the index as it is shown", async () => {
        const element = await card(hass("2.46"));
        expect(texts(element)[0]).toBe("2.5");
        expect(root(element).querySelector(".level")?.textContent).toBe("Moderate");
        expect(root(element).querySelectorAll(".ray.on")).toHaveLength(3);
    });

    it("lights the rays like a clock, the first at one o'clock and the twelfth at the top", async () => {
        const rays = [...root(await card(hass("12"))).querySelectorAll(".ray")];
        const at = (ray: Element, axis: "x1" | "y1") => Number(ray.getAttribute(axis));
        expect(at(rays[0], "x1")).toBeGreaterThan(50);
        expect(at(rays[0], "y1")).toBeLessThan(50);
        expect(at(rays[11], "x1")).toBeCloseTo(50);
        expect(at(rays[11], "y1")).toBeLessThan(50);
    });

    it("leaves the recent peaks empty for a sensor without statistics, rather than pass today's off as theirs", async () => {
        const element = await card(hass("5.4", "en", { points: [[1, 6.1]] }), { show_week: true, show_month: true });
        await settled(element);
        const amounts = [...root(element).querySelectorAll(".extra .amount")].map((node) => node.textContent);
        expect(amounts).toEqual(["—", "—"]);
        expect(texts(element)[1]).toBe("6.1");
    });

    it("keeps a day without any reading unknown, not zero", async () => {
        const element = await card(hass("unavailable", "en", { days: [null, 4.2] }), { show_daily_chart: true, daily_chart_days: 2 });
        await settled(element);
        const daily = root(element).querySelector(".daily-chart") as HTMLElement & {
            items: Array<{ value: number | null; label: string }>;
        };
        expect(daily.items.map((item) => item.value)).toEqual([4.2, null]);
        expect(daily.items[1].label).toMatch(/—$/);
    });
});
