# Ace Narrative Resolver for SillyTavern

A lightweight hidden narrative-resolution extension designed for Ace Combat-style roleplay.

It watches the user's latest message for a risky physical, technical, cognitive, weapons, or piloting action. If one is detected, it rolls a result and injects a hidden mechanical instruction into the **outgoing generation prompt only**. The result is not written into normal chat history.

## Outcomes

- **YES, AND...** — success plus an extra advantage.
- **YES** — straightforward success.
- **YES, BUT...** — the core action succeeds, but there is a meaningful complication or cost.
- **NO** — ordinary failure.
- **NO, AND...** — failure plus a serious new complication.

## Abilities

Scores are 0–5:

- 0 — Untrained
- 1 — Novice
- 2 — Competent
- 3 — Veteran
- 4 — Elite
- 5 — Ace

Abilities:

- **Airmanship** — aircraft handling, formation, navigation, takeoff/landing, terrain flight and recovery.
- **Combat Maneuvering** — BFM, energy fighting, reversals, pursuit geometry, missile evasion and positional combat.
- **Weapons** — aircraft weapons, firearms, explosives and attack timing.
- **Situational Awareness** — visual/radar scan, danger detection, tracking and tactical awareness.
- **Systems** — radar, ECM, sensors, computers, radios, countermeasures and damaged systems.
- **Analysis** — tactical reasoning, prediction, geometry, routes and deduction.
- **Intelligence** — engineering, technical knowledge, memory, repair and problem solving.
- **Reflexes** — split-second reactions and sudden evasive actions.
- **Composure** — focus and performance under fear, pressure or disorientation.
- **Physique** — G tolerance, endurance, injury resistance, running, climbing, carrying and similar physical effort.

There is deliberately **no social/charisma ability**. Dialogue, persuasion, romance, intimidation and ordinary social roleplay are left entirely to characterization and context.

## Action Detection Sensitivity

The settings panel includes a 1–5 sensitivity slider:

- **1 Very Low** — only strongly explicit actions normally trigger.
- **2 Low** — conservative detection.
- **3 Normal** — recommended default.
- **4 High** — short or somewhat implied actions trigger more readily.
- **5 Very High** — almost any matching action language may trigger.

Sensitivity controls whether an action gets a resolution. It does **not** change success probability.

## Difficulty

The extension automatically estimates:

- Routine
- Standard
- Hard
- Extreme

Danger markers such as missile saturation, damaged controls, tunnels/canyons, bad weather, injuries, multiple simultaneous threats and similar circumstances raise difficulty.

The **Difficulty Bias** setting shifts automatic difficulty globally one step easier or harder.

## Regenerate / swipe behavior

By default, **Reuse the same result on regenerate/swipe** is enabled. This prevents regenerating the prose from secretly rerolling a successful action into a failure or vice versa during the current browser session.

Turn the option off if you intentionally want each regeneration to reroll.

## Debug mode

If **Show result as a temporary toast** is enabled, SillyTavern displays the ability, difficulty, d100 roll, target and outcome to you. The model still receives the hidden result automatically.

With debug disabled, resolution is invisible unless you inspect the outgoing prompt.

## Installing from GitHub

SillyTavern installs third-party extensions directly from Git repositories.

1. Create a GitHub repository.
2. Put these files at the **repository root**:
   - `manifest.json`
   - `index.js`
   - `settings.html`
   - `style.css`
   - `README.md`
3. In SillyTavern, open **Extensions**.
4. Choose **Install Extension**.
5. Paste your repository URL.
6. Install it for your user.
7. Reload SillyTavern if requested.
8. Open the Extensions settings panel and expand **Ace Narrative Resolver**.

### Reusing the old Chub repository

You can reuse your existing `Ace-combat-solver` repository. The important part is that `manifest.json` must be at the repository root. The old Chub `src/`, `public/` and workflow files are no longer required for SillyTavern.

## How it works

SillyTavern supports a `generate_interceptor` hook. The extension:

1. Finds the last user message in the generation context.
2. Removes quoted dialogue from action detection so ordinary speech does not trigger checks.
3. Scores the remaining prose against the ten abilities.
4. Selects the strongest ability and, where appropriate, one supporting ability.
5. Estimates difficulty.
6. Rolls d100 in the browser.
7. Creates one of the five narrative outcomes.
8. Inserts a hidden narrator/system-style instruction immediately before the user's action **in the generation-only prompt copy**.
9. The character model narrates the consequence without being told to display stats or dice.

The resolver handles one dominant risky action per user message. If a message contains several independent actions, the most strongly detected action is the one resolved.

## Probability model

Target number:

`45 + primary×8 + support×2 − difficulty×10`

clamped from 15 to 90.

- Very low rolls can become **YES, AND...**
- Rolls at/below target become **YES**
- Up to 20 above target becomes **YES, BUT...**
- Higher rolls become **NO**
- 97–100 always becomes **NO, AND...**

## Compatibility

Designed for recent SillyTavern releases using the documented UI-extension and `generate_interceptor` APIs. The manifest declares SillyTavern 1.17.0 as its minimum version.

No server plugin, external service, Chub API, or API key is required by this extension itself.
