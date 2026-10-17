const MODULE_NAME = 'ace_narrative_resolver';
const LOG_PREFIX = '[Ace Narrative Resolver]';

const DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    airmanship: 3,
    combat: 3,
    weapons: 3,
    awareness: 3,
    systems: 2,
    analysis: 3,
    intelligence: 2,
    reflexes: 3,
    composure: 3,
    physique: 3,
    difficultyBias: 0,
    triggerSensitivity: 3,
    reuseSameAction: true,
    debugVisible: false,
});

const LABELS = Object.freeze({
    airmanship: 'Airmanship',
    combat: 'Combat Maneuvering',
    weapons: 'Weapons',
    awareness: 'Situational Awareness',
    systems: 'Systems',
    analysis: 'Analysis',
    intelligence: 'Intelligence',
    reflexes: 'Reflexes',
    composure: 'Composure',
    physique: 'Physique',
});

const OUTCOME_LABELS = Object.freeze({
    YES_AND: 'YES, AND...',
    YES: 'YES',
    YES_BUT: 'YES, BUT...',
    NO: 'NO',
    NO_AND: 'NO, AND...',
});

const RULES = [
    {
        ability: 'combat',
        patterns: [
            [/\b(dogfight|merge|bfm|one[- ]circle|two[- ]circle|scissors|rolling scissors|flat scissors)\b/i, 4],
            [/\b(get|move|slide|pull|turn|maneuver)\b.{0,30}\b(behind|onto (his|her|their) six|on (his|her|their) six|into firing position)\b/i, 4],
            [/\b(overshoot|reversal|reverse|yo[- ]?yo|lag pursuit|lead pursuit|pure pursuit|energy fight|rate fight|radius fight)\b/i, 4],
            [/\b(evade|dodge|break|jink|shake|defeat)\b.{0,35}\b(missile|fighter|bandit|pursuer|lock|attack)\b/i, 4],
            [/\bforce\b.{0,25}\b(overshoot|mistake|break)\b/i, 3],
        ],
    },
    {
        ability: 'airmanship',
        patterns: [
            [/\b(bank|roll|climb|dive|descend|pitch|yaw|pull up|level off|flare|trim)\b/i, 2],
            [/\b(take ?off|land|landing|touch down|carrier landing|trap|bolter|approach|formation|rejoin|refuel|aerial refuel)\b/i, 3],
            [/\b(terrain follow|nap[- ]of[- ]the[- ]earth|low level|fly through|thread)\b/i, 3],
            [/\b(cobra|kulbit|immelmann|split[- ]?s|barrel roll|aileron roll)\b/i, 4],
            [/\brecover\b.{0,20}\b(stall|spin|aircraft|jet|fighter)\b/i, 4],
        ],
    },
    {
        ability: 'weapons',
        patterns: [
            [/\b(fire|shoot|launch|pickle|release|throw)\b.{0,35}\b(missile|gun|cannon|bomb|rocket|torpedo|weapon|rifle|pistol|grenade)\b/i, 4],
            [/\b(gun run|strafe|strafing|bombing run|missile shot|fox one|fox two|fox three|guns guns guns|burst fire)\b/i, 4],
            [/\b(aim|lead|solution|pipper|lock|tone|sight)\b.{0,30}\b(target|bandit|fighter|bomber|ship|vehicle|soldier|enemy)\b/i, 3],
            [/\b(hit|destroy|disable|shoot down)\b.{0,35}\b(target|bandit|fighter|bomber|aircraft|ship|radar|sam|vehicle)\b/i, 3],
        ],
    },
    {
        ability: 'awareness',
        patterns: [
            [/\b(scan|search|look for|spot|find|locate|identify|tally|visual|peek|listen for)\b/i, 2],
            [/\b(check|watch|monitor)\b.{0,25}\b(radar|rwr|scope|six|airspace|sky|threat|contacts|door|corridor|road)\b/i, 3],
            [/\b(missile warning|spike|nails|mud|bandit|bogey|contact|ambush)\b/i, 2],
            [/\b(keep track|maintain track|situational awareness|tactical picture)\b/i, 4],
        ],
    },
    {
        ability: 'systems',
        patterns: [
            [/\b(radar|ecm|jammer|datalink|irst|ins|gps|tacan|iff|avionics|sensor|autopilot|radio|computer|console|terminal)\b/i, 2],
            [/\b(switch|set|configure|cycle|restart|reset|reboot|reroute|isolate|operate)\b.{0,30}\b(radar|system|avionics|hydraulic|electrical|engine|sensor|weapon|radio|computer|console)\b/i, 4],
            [/\b(jam|spoof|break lock|countermeasure|chaff|flare|decrypt|diagnose)\b/i, 3],
            [/\b(damage control|emergency system|manual reversion)\b/i, 4],
        ],
    },
    {
        ability: 'analysis',
        patterns: [
            [/\b(analy[sz]e|assess|calculate|estimate|predict|anticipate|deduce|infer)\b/i, 3],
            [/\b(pattern|trajectory|intercept|geometry|closure|energy state|enemy tactic|flight path|likely route)\b/i, 2],
            [/\b(plan|plot|choose)\b.{0,30}\b(route|attack|approach|intercept|maneuver|escape|position)\b/i, 3],
            [/\b(work out|figure out)\b.{0,30}\b(what|where|how|why|who)\b/i, 2],
        ],
    },
    {
        ability: 'intelligence',
        patterns: [
            [/\b(remember|recall|recognize|understand|identify from memory)\b/i, 2],
            [/\b(engineer|repair|fix|improvise|jury[- ]rig|bypass|patch)\b/i, 3],
            [/\b(technical|mechanical|aerodynamic|electrical|structural|weapons data|aircraft type|medical)\b/i, 2],
            [/\b(solve|compute|derive|decode)\b/i, 3],
        ],
    },
    {
        ability: 'reflexes',
        patterns: [
            [/\b(react|snap|instantly|immediately|last second|split second)\b/i, 3],
            [/\b(dodge|duck|jink|break hard|snap roll|catch|grab)\b/i, 3],
            [/\b(sudden|unexpected)\b.{0,25}\b(missile|attack|fire|obstacle|threat|explosion)\b/i, 3],
        ],
    },
    {
        ability: 'composure',
        patterns: [
            [/\b(stay calm|keep calm|steady|focus|concentrate|hold it together|keep control)\b/i, 3],
            [/\b(panic|fear|stress|shock|overwhelmed|disoriented|confused under fire)\b/i, 2],
            [/\b(under fire|taking fire|being chased|missile inbound|under pressure)\b/i, 2],
        ],
    },
    {
        ability: 'physique',
        patterns: [
            [/\b(g[- ]?force|high[- ]?g|blackout|greyout|g[- ]loc|strain)\b/i, 3],
            [/\b(endure|withstand|hold breath|stay conscious|push through)\b/i, 3],
            [/\b(injured|wounded|bleeding|pain|burned|broken|concussion)\b/i, 2],
            [/\b(climb|crawl|swim|run|sprint|carry|lift|drag|eject|parachute|jump|vault)\b/i, 2],
        ],
    },
];

const RISK_PATTERNS = [
    /\b(missile|sam|aaa|gunfire|under fire|taking fire|enemy|bandit|bogey|dogfight|attack|intercept|combat|ambush)\b/i,
    /\b(canyon|tunnel|bridge|city|mountain|terrain|low altitude|low level|deck|wreckage|burning)\b/i,
    /\b(damaged|engine out|engine failure|hydraulic|fire|stall|spin|flameout|injured|wounded)\b/i,
    /\b(storm|thunder|icing|night|fog|poor visibility|cloud|smoke)\b/i,
    /\b(outnumbered|multiple missiles|saturation|ace|elite enemy|time pressure)\b/i,
];

const HARD_PATTERNS = [
    /\b(canyon|tunnel|under bridge|through the bridge|terrain masking|nap[- ]of[- ]the[- ]earth)\b/i,
    /\b(damaged|engine out|engine failure|hydraulic failure|on fire|flameout|stall|spin|seriously injured)\b/i,
    /\b(carrier landing|night landing|storm landing|aerial refuel)\b/i,
    /\b(missile inbound|missile closing|multiple missiles|sam saturation|outnumbered|under heavy fire)\b/i,
];

const EXTREME_PATTERNS = [
    /\b(flat spin|both engines out|no controls|control failure|blind landing)\b/i,
    /\btunnel\b.{0,40}\b(damaged|missile|supersonic|afterburner)\b/i,
    /\b(multiple missiles|sam saturation)\b.{0,40}\b(low altitude|damaged|outnumbered)\b/i,
    /\b(critically wounded|collapsing structure|point blank explosion)\b/i,
];

let initialized = false;
let lastCache = {
    chatId: null,
    actionKey: null,
    resolution: null,
};

function clamp(min, max, value) {
    return Math.max(min, Math.min(max, Number(value)));
}

function getSettings() {
    const { extensionSettings } = SillyTavern.getContext();
    if (!extensionSettings[MODULE_NAME]) {
        extensionSettings[MODULE_NAME] = structuredClone(DEFAULT_SETTINGS);
    }

    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (!Object.hasOwn(extensionSettings[MODULE_NAME], key)) {
            extensionSettings[MODULE_NAME][key] = value;
        }
    }

    return extensionSettings[MODULE_NAME];
}

function sensitivityToMinimumScore(sensitivity) {
    const level = Math.round(clamp(1, 5, sensitivity));
    return ({ 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 })[level];
}

function stripQuotedSpeech(text) {
    return String(text ?? '')
        .replace(/“[^”]*”/g, ' ')
        .replace(/"[^"]*"/g, ' ')
        .replace(/‘[^’]*’/g, ' ');
}

function isOutOfCharacter(text) {
    const t = String(text ?? '').trim();
    return /^(ooc\s*:|\[ooc\]|\(ooc\)|\/ooc\b)/i.test(t);
}

function scoreAbilities(text) {
    return RULES.map(rule => {
        const score = rule.patterns.reduce((sum, [regex, weight]) => sum + (regex.test(text) ? weight : 0), 0);
        return { ability: rule.ability, score };
    }).sort((a, b) => b.score - a.score);
}

function estimateDifficulty(text, bias) {
    if (EXTREME_PATTERNS.some(regex => regex.test(text))) {
        return clamp(0, 3, 3 + bias);
    }

    let difficulty = 1;
    const hardHits = HARD_PATTERNS.reduce((sum, regex) => sum + (regex.test(text) ? 1 : 0), 0);
    const riskHits = RISK_PATTERNS.reduce((sum, regex) => sum + (regex.test(text) ? 1 : 0), 0);

    if (hardHits >= 1) difficulty = 2;
    if (hardHits >= 2 || riskHits >= 3) difficulty = 3;

    const routine = /\b(taxi|cruise|climb to|descend to|join formation|rejoin formation|normal landing|normal takeoff|walk over|pick up)\b/i.test(text);
    if (routine && riskHits === 0 && hardHits === 0) difficulty = 0;

    return clamp(0, 3, difficulty + bias);
}

function randomD100() {
    try {
        const values = new Uint32Array(1);
        globalThis.crypto.getRandomValues(values);
        return (values[0] % 100) + 1;
    } catch {
        return Math.floor(Math.random() * 100) + 1;
    }
}

function rollOutcome(primary, support, difficulty) {
    const target = Math.round(clamp(15, 90, 45 + primary * 8 + support * 2 - difficulty * 10));
    const roll = randomD100();
    const critSuccessCutoff = Math.round(clamp(2, 15, target * 0.15));

    if (roll >= 97) return { roll, target, outcome: 'NO_AND' };
    if (roll <= critSuccessCutoff) return { roll, target, outcome: 'YES_AND' };
    if (roll <= target) return { roll, target, outcome: 'YES' };
    if (roll <= Math.min(96, target + 20)) return { roll, target, outcome: 'YES_BUT' };
    return { roll, target, outcome: 'NO' };
}

function difficultyLabel(value) {
    return ['Routine', 'Standard', 'Hard', 'Extreme'][value] ?? 'Standard';
}

function outcomeInstruction(outcome) {
    switch (outcome) {
        case 'YES_AND':
            return 'The intended action succeeds decisively, and it also creates a meaningful extra advantage, opening, information gain, positional gain, saved resource, or other favorable consequence.';
        case 'YES':
            return 'The intended action succeeds cleanly. Do not add an arbitrary penalty merely to increase drama.';
        case 'YES_BUT':
            return 'The core intent succeeds, but attach one meaningful and immediate cost, complication, tradeoff, reduced effect, lost position, expended resource, damage, delay, or new threat. The core success must remain a success.';
        case 'NO':
            return 'The intended action fails or does not achieve its goal. Keep the failure plausible and proportionate; do not automatically injure or kill the user character.';
        case 'NO_AND':
            return 'The intended action fails, and the failure also introduces a serious new complication appropriate to the fiction: worse position, damage, lost energy, separation, systems problem, enemy advantage, or comparable escalation. Do not arbitrarily kill the user character.';
        default:
            return '';
    }
}

function getActionKey(text) {
    return String(text).trim().replace(/\s+/g, ' ').toLowerCase();
}

function resolveAction(actionText, settings) {
    const ranked = scoreAbilities(actionText);
    const primary = ranked[0];
    const minimumScore = sensitivityToMinimumScore(settings.triggerSensitivity);

    if (!primary || primary.score < minimumScore) {
        return null;
    }

    const secondary = ranked.find(item => item.ability !== primary.ability && item.score > 0) ?? null;
    const difficulty = estimateDifficulty(actionText, Number(settings.difficultyBias) || 0);
    const primaryScore = clamp(0, 5, settings[primary.ability] ?? 0);
    const supportScore = secondary ? clamp(0, 5, settings[secondary.ability] ?? 0) : 0;
    const rolled = rollOutcome(primaryScore, supportScore, difficulty);

    return {
        ability: primary.ability,
        support: secondary?.ability ?? null,
        difficulty,
        roll: rolled.roll,
        target: rolled.target,
        outcome: rolled.outcome,
    };
}

function buildHiddenInstruction(resolution) {
    const supportLine = resolution.support
        ? `Supporting ability: ${LABELS[resolution.support]}.`
        : 'Supporting ability: none.';

    return [
        '[ACE NARRATIVE RESOLUTION — HIDDEN MECHANICAL RESULT]',
        'The user\'s attempted risky action has already been resolved mechanically. Treat this result as binding when narrating the immediate consequence.',
        `Primary ability: ${LABELS[resolution.ability]}.`,
        supportLine,
        `Difficulty: ${difficultyLabel(resolution.difficulty)}.`,
        `Outcome: ${OUTCOME_LABELS[resolution.outcome]}.`,
        outcomeInstruction(resolution.outcome),
        'Interpret the result naturally inside the current story.',
        'Do NOT reroll, override, soften, or reverse this result because of narrative preference.',
        'Do NOT mention dice, target numbers, stats, ability names, this extension, or the phrase mechanical result in the prose.',
        'Do not literally announce YES/NO result labels unless those words belong naturally in dialogue.',
        'For dogfights, model position, energy, closure, sensors, weapons employment, damage, terrain, wingmen, enemy skill, and aircraft limits plausibly. A successful maneuver need not automatically destroy an enemy; it achieves the user\'s stated intent and any extra effect implied by the outcome.',
        'For non-aviation actions, interpret the same result using the relevant physical, technical, observational, or cognitive stakes in the scene.',
        'A partial success must preserve the user\'s core success while adding a real consequence. A critical failure should escalate the situation rather than arbitrarily ending the story.',
        'Do not invent additional voluntary actions for the user character beyond what the user attempted. NPCs and the environment may react normally.',
        'Social dialogue, persuasion, charm, intimidation, romance, and other social interactions are not resolved by this system. Roleplay those normally from characterization and context.',
        '[END ACE NARRATIVE RESOLUTION]',
    ].join('\n');
}

function findLastUserMessage(chat) {
    for (let i = chat.length - 1; i >= 0; i -= 1) {
        const message = chat[i];
        if (message?.is_user && typeof message.mes === 'string') {
            return { index: i, message };
        }
    }
    return null;
}

function updateLastResultUI(resolution) {
    const el = document.querySelector('#ace_resolver_last_result');
    if (!el) return;

    if (!resolution) {
        el.textContent = 'None';
        return;
    }

    const support = resolution.support ? ` + ${LABELS[resolution.support]}` : '';
    el.textContent = `${OUTCOME_LABELS[resolution.outcome]} — ${LABELS[resolution.ability]}${support}, ${difficultyLabel(resolution.difficulty)} (roll ${resolution.roll}, target ${resolution.target})`;
}

function maybeShowDebug(resolution, settings) {
    if (!settings.debugVisible || !resolution) return;
    const support = resolution.support ? ` + ${LABELS[resolution.support]}` : '';
    const text = `${OUTCOME_LABELS[resolution.outcome]} — ${LABELS[resolution.ability]}${support}, ${difficultyLabel(resolution.difficulty)} (roll ${resolution.roll}, target ${resolution.target})`;
    if (globalThis.toastr?.info) {
        globalThis.toastr.info(text, 'Ace Resolver');
    } else {
        console.info(LOG_PREFIX, text);
    }
}

/**
 * SillyTavern generate_interceptor.
 * The injected narrator/system-style message exists only in the outgoing prompt copy.
 */
globalThis.AceNarrativeResolver_interceptGeneration = async function (chat, _contextSize, _abort, type) {
    try {
        const settings = getSettings();
        if (!settings.enabled || !Array.isArray(chat)) return;
        if (type === 'quiet' || type === 'impersonate') return;

        const found = findLastUserMessage(chat);
        if (!found) return;

        const rawText = found.message.mes;
        if (!rawText || isOutOfCharacter(rawText)) return;

        const actionText = stripQuotedSpeech(rawText);
        const actionKey = getActionKey(actionText);
        const { chatId } = SillyTavern.getContext();

        let resolution = null;
        const canReuse = settings.reuseSameAction
            && lastCache.resolution
            && lastCache.chatId === (chatId ?? null)
            && lastCache.actionKey === actionKey;

        if (canReuse) {
            resolution = structuredClone(lastCache.resolution);
        } else {
            resolution = resolveAction(actionText, settings);
            lastCache = {
                chatId: chatId ?? null,
                actionKey,
                resolution: resolution ? structuredClone(resolution) : null,
            };
        }

        updateLastResultUI(resolution);
        if (!resolution) return;

        maybeShowDebug(resolution, settings);

        const hiddenInstruction = buildHiddenInstruction(resolution);
        const injection = {
            name: 'Ace Narrative Resolver',
            is_user: false,
            is_system: false,
            send_date: Date.now(),
            mes: hiddenInstruction,
            extra: {
                type: 'narrator',
                ace_narrative_resolver: true,
            },
        };

        // Put the hidden mechanical result immediately before the user's action.
        // The interceptor receives a generation-only chat copy, so this does not persist in chat history.
        chat.splice(found.index, 0, injection);
    } catch (error) {
        console.error(LOG_PREFIX, 'Generation interceptor failed:', error);
    }
};

function getExtensionFolder() {
    try {
        const path = new URL(import.meta.url).pathname;
        const marker = '/scripts/extensions/';
        const pos = path.indexOf(marker);
        if (pos >= 0) {
            return path.slice(pos + marker.length).replace(/\/index\.js$/, '');
        }
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not derive extension folder:', error);
    }
    return 'third-party/ace-narrative-resolver';
}

function bindNumberSetting(selector, key, min = 0, max = 5) {
    const settings = getSettings();
    const element = $(selector);
    element.val(settings[key]);
    element.off(`change.${MODULE_NAME}`).on(`change.${MODULE_NAME}`, function () {
        const value = Math.round(clamp(min, max, Number($(this).val())));
        settings[key] = value;
        $(this).val(value);
        SillyTavern.getContext().saveSettingsDebounced();
    });
}

async function initUI() {
    if (initialized) return;
    initialized = true;

    try {
        const context = SillyTavern.getContext();
        const settings = getSettings();
        const extensionFolder = getExtensionFolder();
        const html = await context.renderExtensionTemplateAsync(extensionFolder, 'settings', {});

        if (!document.querySelector('#ace_resolver_settings')) {
            $('#extensions_settings2').append(html);
        }

        $('#ace_resolver_enabled')
            .prop('checked', settings.enabled)
            .off(`change.${MODULE_NAME}`)
            .on(`change.${MODULE_NAME}`, function () {
                settings.enabled = Boolean($(this).prop('checked'));
                context.saveSettingsDebounced();
            });

        for (const key of Object.keys(LABELS)) {
            bindNumberSetting(`#ace_resolver_${key}`, key);
        }

        $('#ace_resolver_sensitivity')
            .val(settings.triggerSensitivity)
            .off(`input.${MODULE_NAME} change.${MODULE_NAME}`)
            .on(`input.${MODULE_NAME} change.${MODULE_NAME}`, function () {
                const value = Math.round(clamp(1, 5, Number($(this).val())));
                settings.triggerSensitivity = value;
                $('#ace_resolver_sensitivity_value').text(value);
                context.saveSettingsDebounced();
            });
        $('#ace_resolver_sensitivity_value').text(settings.triggerSensitivity);

        $('#ace_resolver_difficulty')
            .val(String(settings.difficultyBias))
            .off(`change.${MODULE_NAME}`)
            .on(`change.${MODULE_NAME}`, function () {
                settings.difficultyBias = Math.round(clamp(-1, 1, Number($(this).val())));
                context.saveSettingsDebounced();
            });

        $('#ace_resolver_reuse')
            .prop('checked', settings.reuseSameAction)
            .off(`change.${MODULE_NAME}`)
            .on(`change.${MODULE_NAME}`, function () {
                settings.reuseSameAction = Boolean($(this).prop('checked'));
                context.saveSettingsDebounced();
            });

        $('#ace_resolver_debug')
            .prop('checked', settings.debugVisible)
            .off(`change.${MODULE_NAME}`)
            .on(`change.${MODULE_NAME}`, function () {
                settings.debugVisible = Boolean($(this).prop('checked'));
                context.saveSettingsDebounced();
            });

        console.log(LOG_PREFIX, 'Extension loaded.');
    } catch (error) {
        initialized = false;
        console.error(LOG_PREFIX, 'Failed to initialize settings UI:', error);
    }
}

// Current SillyTavern supports lifecycle hooks, but this idempotent DOM-ready path
// also keeps the extension simple to install from a Git repository.
if (globalThis.jQuery) {
    globalThis.jQuery(initUI);
} else {
    document.addEventListener('DOMContentLoaded', initUI, { once: true });
}

export async function onActivate() {
    await initUI();
}
