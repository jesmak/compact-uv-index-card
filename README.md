# Compact UV index card

Home Assistant dashboard card that shows the UV index as a sun with a ray for each step, at any size a dashboard gives
it.

[![GitHub Release][releases-shield]][releases] [![GitHub Release Date][release-date-shield]][releases] [![HACS][hacs-shield]][hacs] [![License][license-shield]](LICENSE)

<p>
<img src="https://raw.githubusercontent.com/jesmak/compact-uv-index-card/main/docs/images/everything-light.png#gh-light-mode-only" width="400" alt="A sun with five of its twelve rays lit beside a UV index of 5.4, moderate, and today's peak, protection advice under it, then the peaks of yesterday, the past week and the past month, and bars of the last 14 days' peaks in their levels' colours">
<img src="https://raw.githubusercontent.com/jesmak/compact-uv-index-card/main/docs/images/everything-dark.png#gh-dark-mode-only" width="400" alt="A sun with five of its twelve rays lit beside a UV index of 5.4, moderate, and today's peak, protection advice under it, then the peaks of yesterday, the past week and the past month, and bars of the last 14 days' peaks in their levels' colours">
<img src="https://raw.githubusercontent.com/jesmak/compact-uv-index-card/main/docs/images/sizes-light.png#gh-light-mode-only" width="400" alt="The same card at five sizes in one section, from a quarter of its width and one row to all of it and three rows, the sun beside the figures, above them, or small beside unlabelled figures">
<img src="https://raw.githubusercontent.com/jesmak/compact-uv-index-card/main/docs/images/sizes-dark.png#gh-dark-mode-only" width="400" alt="The same card at five sizes in one section, from a quarter of its width and one row to all of it and three rows, the sun beside the figures, above them, or small beside unlabelled figures">
</p>

## What is it?

A small card for a UV index sensor. A sun has a ray for each step of the index, lit as far as the index reaches, with
the index beside it and the day's highest so far. Tapping it opens the sensor's details.

- **The sun** has twelve rays, one for each step of the index. Each lit ray has the colour of its own step's level,
  so the rays are a scale as well as a reading, and the disc has the colour of the level now. While the sun is up the
  lit rays glow.
- **The level** shows as five bars beside the index, one for each of the WHO's levels from low to extreme, and its
  name under the index.
- **How to protect yourself**, from index 3 on: shade, clothing, a hat and sunscreen around midday, and from 8 on,
  avoiding the midday sun altogether.
- **Recent days**, if you want them: the highest index of yesterday, and of the past week and the past month (the
  last 7 and 30 days).
- **Two small charts**, if you want them: each day's highest index as bars, and the index over the last hours as a
  line, both in their levels' colours. Pointing at either, or touching it, shows the value there.

It fits whatever space it is given. In a sections view it works at every width from a quarter of the section to all
of it, and at one row or more. In a masonry view or a horizontal stack it is as tall as its contents need.

[Compact rain gauge card](https://github.com/jesmak/compact-rain-gauge-card) is its sibling for rain, in the same
form.

## Installation

### With HACS

1. Add this repository to HACS custom repositories with type **Dashboard**
2. Search for Compact UV index card in HACS and download it
3. Refresh your browser

### Manual

1. Take `dist/compact-uv-index-card.js` from the source code of the [latest release][releases] and copy it to the
   `config/www` folder of your Home Assistant installation
2. In Home Assistant settings, open dashboards, click the three dots at the top right and open resources
3. Add a new resource with the path `/local/compact-uv-index-card.js` and type JavaScript
4. Refresh your browser

## Options

The card has a visual editor. Add it from the card picker, and it offers a UV index sensor to start with. The options
can also be written by hand.

| Name                 | Type    | Description                                                        | Default                           |
| -------------------- | ------- | ------------------------------------------------------------------ | --------------------------------- |
| `type`               | string  | **Required.** `custom:compact-uv-index-card`                       |                                   |
| `entity`             | string  | **Required.** The UV index now                                     |                                   |
| `language`           | string  | The card's own language, such as `fi`                              | Home Assistant's language         |
| `animate_sun`        | boolean | Let the lit rays glow while the sun is up                          | `true`                            |
| `show_level`         | boolean | Bars beside the index for its level, and the level's name under it | `true`                            |
| `show_advice`        | boolean | How to protect yourself, from index 3 on                           | `true`                            |
| `show_yesterday`     | boolean | Yesterday's highest index                                          | `false`                           |
| `show_week`          | boolean | The highest index of the last 7 days                               | `false`                           |
| `show_month`         | boolean | The highest index of the last 30 days                              | `false`                           |
| `show_daily_chart`   | boolean | Each day's highest index, as bars                                  | `false`                           |
| `daily_chart_days`   | number  | How many days the bars show, from 2 to 60                          | 14                                |
| `show_hourly_chart`  | boolean | The index over the last hours, as a line                           | `false`                           |
| `hourly_chart_hours` | number  | How many hours the line shows, from 1 to 168                       | 24                                |
| `border_colour`      | string  | Any CSS colour for the sun's outline                               | the theme's secondary text colour |
| `tap_action`         | object  | What a tap does, as for Home Assistant's own cards                 | `action: more-info`               |
| `hold_action`        | object  | What holding it does                                               | none                              |
| `double_tap_action`  | object  | What a double tap does                                             | none                              |

A chart length that isn't a number, such as `a day`, shows an error instead of the card.

## What it shows

The index is written in your locale, in the sensor's own display precision when it has one in Home Assistant, and
otherwise to one decimal at most. While the sensor is unavailable its figure is a dash, no ray is lit and the disc is
empty. The disc is empty at night too, when the index is 0.

The levels and their colours are the WHO's, read on the index rounded to a whole number, as it is reported. 2.6 is
a 3, which is moderate.

| Index     | Level     | Rays lit  | Advice                     |
| --------- | --------- | --------- | -------------------------- |
| 0–2       | Low       | 0 to 2    | none                       |
| 3–5       | Moderate  | 3 to 5    | Protect yourself at midday |
| 6–7       | High      | 6 or 7    | Protect yourself at midday |
| 8–10      | Very high | 8 to 10   | Avoid the midday sun       |
| 11 and up | Extreme   | 11 or all | Avoid the midday sun       |

A theme can change the colours with `--uv-index-low-color`, `--uv-index-moderate-color`, `--uv-index-high-color`,
`--uv-index-very-high-color` and `--uv-index-extreme-color`.

## Sizes

The card measures the space it gets and lays itself out to fit:

| Space                                      | Layout                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| Wide enough for the figures beside the sun | The sun, and the index, its level and today's peak with labels beside it |
| Plenty of width                            | The same, with larger figures                                            |
| Narrow, such as a quarter of a section     | The sun above the figures, without labels                                |
| Low, such as one row of a section          | A small sun, the figures beside it without labels                        |

The advice, the recent days and the charts go under the sun, across the card, the recent days and each chart on a tile
of their own. In a sections view the card starts at half the width and three rows, with a row more for the recent
days and for each chart, and can be resized down to a quarter of the width and one row. When it is too low for
everything, the hourly chart is left out first, then the daily bars, then the recent days and last the advice, rather
than squeezing the figures out of their labels. The figures are never cut short. When they need the room, the sun gets
narrower. Otherwise it keeps its shape, growing with the card's height and shrinking with it.

## Examples

The index with the past week's peak and two weeks of daily bars:

```yaml
type: custom:compact-uv-index-card
entity: sensor.uv_index
show_week: true
show_daily_chart: true
daily_chart_days: 14
```

A still sun without the advice, with the index over the last two days:

```yaml
type: custom:compact-uv-index-card
entity: sensor.uv_index
animate_sun: false
show_advice: false
show_hourly_chart: true
hourly_chart_hours: 48
```

## Data

Today's peak and the hourly chart come from the sensor's recorded states, which Home Assistant keeps for ten days by
default, so the line reaches back a week at most. Recent days and the daily bars come from Home Assistant's long-term
statistics, which it keeps for good. They need the sensor to have `state_class: measurement`, as UV index sensors
usually do. Without it those parts stay empty. A day's peak is the highest of its hourly maximums. Today's is the
highest reading since midnight, since the statistics reach only to the last full hour.

The card asks for the history when it is shown and every 15 minutes after that, and asks for the statistics only when
its options need them.

## Translating

The card's texts are in `src/localize/languages/`, one JSON file per language, named by its language code, such as
`en.json` and `fi.json`. To add a language, copy `en.json` to the new language's code, such as `sv.json`, and translate
the values. Nothing else needs changing. The card finds the file by itself, offers it in the editor, and uses it when
Home Assistant is set to that language. A text left out falls back to English. Texts ending in `_short` are what the
narrowest cards show in place of the longer ones, so keep them brief.

## Development

Requires Node 22.13 or newer.

```
npm install
npm run check
```

`npm run check` typechecks, lints, checks formatting, runs the tests and builds `dist/compact-uv-index-card.js`, which
is the file HACS installs and is committed to the repository.

| Path                           | What it contains                                                 |
| ------------------------------ | ---------------------------------------------------------------- |
| `src/compact-uv-index-card.ts` | The card itself, its layouts, and asking for the history         |
| `src/sun.ts`                   | Drawing the sun and its rays                                     |
| `src/levels.ts`                | The WHO's levels, their colours and their advice                 |
| `src/chart.ts`                 | The small charts and their bubbles                               |
| `src/history.ts`               | Reading the recorder for the peaks of past days and the readings |
| `src/gauge.ts`                 | Reading the sensor and writing the index                         |
| `src/actions.ts`               | Telling a tap from a hold or a double tap                        |
| `src/editor.ts`                | The visual editor                                                |
| `src/localize/languages/`      | The card's texts, one JSON file per language                     |
| `docs/screenshots.json`        | The made-up data the README's screenshots are taken from         |
| `tests/`                       | Tests, run with vitest                                           |

## Support

Hey dude! Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/jesmak)

## Thanks

To [@t1gr0u](https://github.com/t1gr0u) for [uv-index-card](https://github.com/t1gr0u/uv-index-card), which this card
was made to replace in the same spirit. It is written from scratch.

## License

MIT, see [LICENSE](LICENSE).

[releases-shield]: https://img.shields.io/github/release/jesmak/compact-uv-index-card.svg?style=for-the-badge
[release-date-shield]: https://img.shields.io/github/release-date/jesmak/compact-uv-index-card?style=for-the-badge
[releases]: https://github.com/jesmak/compact-uv-index-card/releases
[hacs-shield]: https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge
[hacs]: https://hacs.xyz/docs/faq/custom_repositories/
[license-shield]: https://img.shields.io/github/license/jesmak/compact-uv-index-card.svg?style=for-the-badge
