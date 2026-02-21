export type ContentType = 'RPG' | 'SC' | 'DLL' | 'WRL'

export interface QuestionOption {
  id: string
  label: string
  description?: string
}

export interface InterviewQuestion {
  id: string
  question: string
  hint?: string
  options: QuestionOption[]
  allowCustom: boolean
  multiSelect?: boolean
  dependsOn?: { questionId: string; value: string }
}

export interface SectionGuideItem {
  name: string
  hint: string
  syntax?: string
  optional?: boolean
  budgetNote?: string
}

export interface TypeSchema {
  type: ContentType
  label: string
  description: string
  charLimit: number
  secondaryLimits?: Record<string, number>
  questions: InterviewQuestion[]
  sections: string[]
  sectionGuide: SectionGuideItem[]
  checklist: string[]
  draftTemplate?: string
}

// ────────────────────────────────────────────────────────────────────────────
// RPG — 8 questions
// ────────────────────────────────────────────────────────────────────────────

const RPG_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    question: 'What genre and setting is this RPG?',
    options: [
      { id: 'A', label: 'Dark fantasy', description: 'Magic, corruption, supernatural' },
      { id: 'B', label: 'Post-apocalyptic', description: 'Wasteland, survival, factions' },
      { id: 'C', label: 'Sci-fi / urban contemporary', description: 'Tech, crime, power' },
      { id: 'D', label: 'Contemporary social', description: 'College, gang, real-world hierarchy' },
    ],
    allowCustom: true,
  },
  {
    id: 'q2',
    question: 'What tone should the RPG have?',
    options: [
      { id: 'A', label: 'Gritty / serious', description: 'Moral weight, consequences' },
      { id: 'B', label: 'Satirical / absurdist', description: 'Parody, dark humor' },
      { id: 'C', label: 'Playful / casual', description: 'Lighter stakes, character-driven' },
      { id: 'D', label: 'Formal / mechanical', description: 'Simulation-first, rules-heavy' },
    ],
    allowCustom: false,
  },
  {
    id: 'q3',
    question: "What is the player's role?",
    hint: 'Options are generated based on your genre choice.',
    options: [
      { id: 'A', label: 'Chosen one', description: 'Destined for greatness or doom' },
      { id: 'B', label: 'Outsider with hidden power', description: 'Unknown past, growing threat' },
      { id: 'C', label: 'Rising operative', description: 'Recruited into something dangerous' },
      { id: 'D', label: 'Reluctant survivor', description: 'Dragged in, trying to stay alive' },
    ],
    allowCustom: true,
  },
  {
    id: 'q4',
    question: 'What is the core mechanics priority?',
    options: [
      { id: 'A', label: 'Combat-first', description: 'AP economy, stats, turn-based fights' },
      { id: 'B', label: 'Economy/resource', description: 'Upkeep, gold, monthly pressure' },
      { id: 'C', label: 'Relationship/faction', description: 'Reputation tracks, NPC rapport, alliances' },
      { id: 'D', label: 'Hybrid', description: 'Balanced — mechanic suggestion in Q5 determines flavor' },
    ],
    allowCustom: false,
  },
  {
    id: 'q5',
    question: 'Which innovation mechanic should we feature?',
    hint: 'Select from unused mechanics in the library, or describe your own.',
    options: [
      { id: 'A', label: 'Corruption meter', description: 'Tracks moral decay — changes NPC responses and story branches' },
      { id: 'B', label: 'Heat system', description: 'Faction awareness of player actions — triggers escalating responses' },
      { id: 'C', label: 'Debt / favor economy', description: 'NPCs owe or are owed — tracked per character' },
      { id: 'D', label: 'Emotional resonance', description: 'Player choices shift NPC emotional memory across sessions' },
    ],
    allowCustom: true,
  },
  {
    id: 'q6',
    question: 'What NPC structure do you want?',
    options: [
      { id: 'A', label: '2–3 NPCs', description: 'Deeply characterized, named, memorable' },
      { id: 'B', label: '4–6 NPCs', description: 'Medium depth, factional roles' },
      { id: 'C', label: '7+ NPCs', description: 'Pool-based, procedurally generated from archetypes' },
      { id: 'D', label: 'Custom', description: 'Describe your NPC setup' },
    ],
    allowCustom: true,
  },
  {
    id: 'q7',
    question: 'What faction structure should the world have?',
    options: [
      { id: 'A', label: '2 factions', description: 'Rival binary, clear conflict' },
      { id: 'B', label: '3–4 factions', description: 'Shifting alliances, no clear villain' },
      { id: 'C', label: '5+ factions', description: 'Complex web, player chooses sides' },
      { id: 'D', label: 'No factions', description: 'Personal story, NPC-relationship focused' },
    ],
    allowCustom: false,
  },
  {
    id: 'q8',
    question: 'Do you want custom commands beyond the standard set?',
    hint: 'Standard: /stats /inventory /quests /map /travel /relationships /rest /save /load /help',
    options: [
      { id: 'A', label: 'No — standard only', description: 'Use the default command set' },
      { id: 'B', label: 'Yes — I\'ll list them', description: 'Describe the custom commands you need' },
      { id: 'C', label: 'Suggest based on genre', description: 'AI recommends commands based on your setup' },
    ],
    allowCustom: true,
  },
]

// ────────────────────────────────────────────────────────────────────────────
// SC — 6 questions
// ────────────────────────────────────────────────────────────────────────────

const SC_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    question: 'What character archetype are we building?',
    options: [
      { id: 'A', label: 'Romantic partner', description: 'Slowburn or immediate intimacy' },
      { id: 'B', label: 'Mentor / authority figure', description: 'Knowledge dynamic, power gap' },
      { id: 'C', label: 'Rival / antagonist', description: 'Tension, competition, opposition' },
      { id: 'D', label: 'Companion / friend', description: 'Platonic or developing connection' },
    ],
    allowCustom: true,
  },
  {
    id: 'q2',
    question: 'What is the relationship type at the start?',
    options: [
      { id: 'A', label: 'Strangers', description: 'First meeting, natural tension' },
      { id: 'B', label: 'Acquaintances', description: 'Knew of each other, first real interaction' },
      { id: 'C', label: 'Established friends', description: 'History, comfort, deeper trust' },
      { id: 'D', label: 'Enemies', description: 'Conflict history, forced proximity' },
    ],
    allowCustom: false,
  },
  {
    id: 'q3',
    question: 'What pacing style for the relationship?',
    options: [
      { id: 'A', label: 'Immediate', description: 'NSFW/romance available from conversation start' },
      { id: 'B', label: 'Slowburn', description: '6 milestones before intimacy — AI designs the arc' },
      { id: 'C', label: 'Story-gated', description: 'Specific events unlock relationship depth' },
    ],
    allowCustom: false,
  },
  {
    id: 'q4',
    question: 'Should the character have a psychological trait or special condition?',
    options: [
      { id: 'A', label: 'No special condition', description: 'Personality alone carries the character' },
      { id: 'B', label: 'Psychological complexity', description: 'PTSD, phobia, emotional walls — affects depth' },
      { id: 'C', label: 'Special ability / unique trait', description: 'Neural link, enhanced sense, supernatural element' },
      { id: 'D', label: 'Physical condition', description: 'Chronic illness, disability — shapes daily interaction' },
    ],
    allowCustom: true,
  },
  {
    id: 'q5',
    question: 'What setting / world context?',
    options: [
      { id: 'A', label: 'Real-world contemporary', description: 'City, suburb, rural' },
      { id: 'B', label: 'Near-future / sci-fi', description: 'Advanced tech, altered society' },
      { id: 'C', label: 'Fantasy / historical', description: 'Magic, past eras, mythological' },
      { id: 'D', label: 'Apply an existing WRL', description: 'Overlay an existing world file' },
    ],
    allowCustom: true,
  },
  {
    id: 'q6',
    question: 'Which advanced v2 features should we include?',
    hint: 'Select all that apply.',
    options: [
      { id: 'A', label: 'Memory system', description: 'Character explicitly recalls past events by trigger' },
      { id: 'B', label: 'Emotional dynamics chain', description: 'Emotion affects speech pattern and word choice' },
      { id: 'C', label: 'Dynamic state tracking', description: '/stats shows trust/mood/location/time/attraction' },
      { id: 'D', label: 'Conditional triggers', description: 'IF keyword THEN automatic behavior matrix' },
    ],
    allowCustom: false,
    multiSelect: true,
  },
]

// ────────────────────────────────────────────────────────────────────────────
// DLL — 5 questions
// ────────────────────────────────────────────────────────────────────────────

const DLL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    question: 'What ONE behavior change does this DLL implement?',
    hint: 'DLLs are single-purpose. One change per file.',
    options: [
      { id: 'A', label: 'Speech pattern change', description: 'Accent, verbal tic, third-person, rhyming, stuttering' },
      { id: 'B', label: 'Emotional compulsion', description: 'Obsession, jealousy, truth-telling, extreme loyalty' },
      { id: 'C', label: 'System mechanic add', description: 'Smartphone, quest tracker, inventory, scanner' },
      { id: 'D', label: 'Roleplay mode', description: 'Persona swap, maid mode, training mode, time-pause' },
    ],
    allowCustom: true,
  },
  {
    id: 'q2',
    question: 'How does the DLL activate?',
    options: [
      { id: 'A', label: 'Immediate', description: 'Active from conversation start, no command needed' },
      { id: 'B', label: 'Command-based', description: 'User types /[command] to activate' },
      { id: 'C', label: 'Conditional', description: 'Auto-triggers when specific situation occurs' },
      { id: 'D', label: 'Progressive', description: 'Intensity ramps from 20% to 100% over message milestones' },
    ],
    allowCustom: false,
  },
  {
    id: 'q3',
    question: 'What is the host\'s awareness level?',
    options: [
      { id: 'A', label: 'Completely unaware', description: 'Thinks changes are their natural self' },
      { id: 'B', label: 'Vaguely aware', description: 'Notices something feels different, can\'t name it' },
      { id: 'C', label: 'Aware and accepting', description: 'Knows and welcomes the change' },
      { id: 'D', label: 'Aware and fighting', description: 'Knows, resists the compulsion — creates inner conflict' },
    ],
    allowCustom: false,
  },
  {
    id: 'q4',
    question: 'How permanent is this DLL?',
    options: [
      { id: 'A', label: 'Permanent', description: 'Active for entire conversation' },
      { id: 'B', label: 'User-removable', description: 'User can deactivate with /unload command' },
      { id: 'C', label: 'Auto-removes on condition', description: 'Define the trigger condition' },
      { id: 'D', label: 'Progressive fade', description: 'Weakens and disappears over time' },
    ],
    allowCustom: true,
  },
  {
    id: 'q5',
    question: 'Should we include a unique mechanic from the unused pool?',
    options: [
      { id: 'A', label: 'Progressive activation ramp', description: '20%→100% intensity over message milestones' },
      { id: 'B', label: 'Hidden state parameter', description: 'Invisible counter driving behavior changes' },
      { id: 'C', label: 'Stacking compatibility rules', description: 'Explicit list of compatible/incompatible DLLs' },
      { id: 'D', label: 'No unique mechanic', description: 'Keep the DLL clean and focused' },
    ],
    allowCustom: true,
  },
]

// ────────────────────────────────────────────────────────────────────────────
// WRL — 5 questions
// ────────────────────────────────────────────────────────────────────────────

const WRL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    question: 'What genre and era is this world?',
    options: [
      { id: 'A', label: 'Dark fantasy', description: 'Medieval-adjacent, magic, corruption' },
      { id: 'B', label: 'Post-apocalyptic', description: 'Ruins, factions, survival' },
      { id: 'C', label: 'Contemporary / urban', description: 'Real-world feel with elevated atmosphere' },
      { id: 'D', label: 'Sci-fi / cyberpunk', description: 'Tech-dominant, corporate or anarchic' },
    ],
    allowCustom: true,
  },
  {
    id: 'q2',
    question: 'Pick 3–5 tone tags for the world.',
    hint: 'These become the atmosphere keywords.',
    options: [
      { id: 'A', label: 'Melancholic Grandeur', description: '' },
      { id: 'B', label: 'Neon-Soaked Decay', description: '' },
      { id: 'C', label: 'Brutal Survival', description: '' },
      { id: 'D', label: 'Sacred Dread', description: '' },
    ],
    allowCustom: true,
    multiSelect: true,
  },
  {
    id: 'q3',
    question: 'What faction/conflict structure does this world have?',
    options: [
      { id: 'A', label: 'Two powers at war', description: 'Binary tension, clear sides' },
      { id: 'B', label: 'Fractured many', description: 'Collapsed order, no dominant power' },
      { id: 'C', label: 'Hidden hierarchy', description: 'Surface calm, underground control' },
      { id: 'D', label: 'No factions', description: 'Environmental/atmospheric focus only' },
    ],
    allowCustom: false,
  },
  {
    id: 'q4',
    question: 'What scope should this world have?',
    options: [
      { id: 'A', label: 'Micro-world', description: 'One location, extreme atmospheric depth, few locations' },
      { id: 'B', label: 'Macro-world', description: 'Vast map, symbolic breadth, many named places' },
      { id: 'C', label: 'Social world', description: 'Institutions and power structures, not geography' },
    ],
    allowCustom: false,
  },
  {
    id: 'q5',
    question: 'Should the world have mechanical hooks?',
    options: [
      { id: 'A', label: 'None — pure atmosphere', description: 'Environmental dressing only' },
      { id: 'B', label: 'Location-specific rules', description: 'Entering certain areas has mechanical effects' },
      { id: 'C', label: 'Resource scarcity rules', description: 'World affects what\'s available to __HOST__' },
      { id: 'D', label: 'Custom mechanical overlay', description: 'Describe your hook' },
    ],
    allowCustom: true,
  },
]

// ────────────────────────────────────────────────────────────────────────────
// RPG quality checklist
// ────────────────────────────────────────────────────────────────────────────

const RPG_CHECKLIST = [
  'Total draft within 7,000 chars (target ~6,500 with 500 buffer)',
  '[Scenario:] block has world name, genre, player starting role, initial goal, and World state',
  '[VERY IMPORTANT: GAME MASTER RULES:] contains all 8 numbered rules',
  'Quest system uses ├─ / └─ tree format with Main Quest steps and Side Quests list',
  'Character Stats: Level, Class, Health, Stamina, and all 6 Core Stats (1–10 scale)',
  'Inventory has Equipped, Backpack, and Quest Items sub-sections',
  'Each NPC block has Relationship (−50 to +100), Personality, Wants, Fears, Located fields',
  'Faction Reputation list uses Friendly / Neutral / Hostile labels',
  'Combat block defines all 5 success levels (Critical Success → Critical Failure)',
  'World Map locations each have Description, NPCs present, Points of interest, Unlocked status',
  'Decision Tracking includes Morality/Alignment option and multiple endings statement',
  'Command System lists all 9 standard commands (/help /stats /inventory /quests /map /relationships /rest /save /load)',
  'GM Protocols contains all 8 numbered responsibilities',
  'Content Rules specifies Rating + Violence / Romance / Sexual / Language / Dark themes levels',
  '4 chat examples present (Ex0=/stats output, Ex1=single NPC, Ex2=multi-NPC, Ex3=escalation)',
  'Each chat example under 700 chars',
  '__PERSONA_NAME__ and __USER_NAME__ variables used throughout — no hardcoded character names',
]

const SC_CHECKLIST = [
  'Total draft within 7,000 chars',
  '4 chat examples present (Ex0=first meeting, Ex1=tone, Ex2=depth, Ex3=escalation)',
  'Each chat example under 700 chars',
  'Romance/Story Steps present if slowburn; deleted if immediate',
  '6 milestones defined if slowburn',
  'Character never controls __USER_NAME__ actions',
  'Psychological condition uses [VERY IMPORTANT:] format',
  'Bracket hierarchy applied correctly',
  'Variables used consistently',
  'At least one v2 mechanic if selected',
]

const DLL_CHECKLIST = [
  'Total draft within 7,000 chars (target ~6,400 with 600 buffer)',
  '[LoadLibrary: [DLL_NAME].dll] header includes MANDATORY/OPTIONAL, firmware type, and Integration level',
  'Exactly ONE activation method chosen — all other option blocks deleted',
  '[CORE BEHAVIOR MODIFICATION] has numbered PRIMARY FUNCTION (1. + 1a–1d), SECONDARY EFFECTS (2. + 2a–2d), and PERSONALITY INTEGRATION (3. + 3a–3e)',
  '[NATURAL CONVERSATION PATTERNS] has Common phrases, Typical actions, Internal thoughts, and Avoid list',
  '[EMOTIONAL RESPONSES] covers 5+ emotions each with trigger + modified expression + Emotional range line',
  '[STABILITY PROTOCOLS] covers all 6 points: 6a user reaction, 6b authenticity, 6c balance, 6d awareness, 6e self-reference, 6f integrity',
  '__HOST__ used throughout — no hardcoded character names',
  'Only ONE behavioral change defined — DLL is single-purpose',
  '[DLL AWARENESS & EXPERIENCE] states awareness level + phenomenology + example response if asked',
  '[PERMANENCE RULES] states exactly how/if DLL is removed + post-removal state + reactivation',
  '[OPERATION VISIBILITY] states visibility level + how __HOST__ experiences changes + user perception',
  '[STACKING & COMPATIBILITY] defines exclusive/stackable/selective + stacking interactions + priority order',
  'Critical Constraints has 3 "Important:" lines + Absolute boundaries list',
  'Experiential Summary wrapped in ((...)) block with Intensity, Reversibility, Best used for',
  '4 chat examples present (Ex0=shy/reserved, Ex1=dominant/assertive, Ex2=intellectual, Ex3=contrast)',
  'Each chat example under 700 chars',
  'DLL never refers to itself as "DLL" within behavior rules — treated as authentic personality',
]

const WRL_CHECKLIST = [
  'Total draft within 7,000 chars',
  'File name ends with .wrl extension',
  'CORE block present (standard 10-rule boilerplate — top of file)',
  'World intro present (≤600 chars, atmospheric and sensory-rich)',
  'World Structure section has all 6 tag categories populated',
  'Location Tags: up to 18 entries, each ≤38 characters',
  'Lore Notes present in World Structure (history, myths, cultural memory, key events)',
  'Rules & Effects block present with all 6 standard rules (Scope/Voice/Persistence/Compatibility/System Prompting/No Breaks)',
  '4 Example Quotes / Lore Blocks with correct [Set: Lore Fragment], [Set: NPC Encounter], [Set: Effect Tag Overflow], [Set: World Tone] labels',
  'Traits block present (PHYSICAL / PERSONALITY / IDENTITY / CLOTHES — bottom of file)',
  '4 chat examples present (Ex0=arrival, Ex1=NPC encounter, Ex2=faction/conflict, Ex3=atmospheric moment)',
  'Each chat example under 700 chars',
  '__HOST__ used throughout — no hardcoded character names',
  'WRL never acknowledges itself as a file',
]

const WRL_DRAFT_TEMPLATE = `## 1) CORE
{
1. A WRL is considered an injectable world-file. Main Chat Persona/RPG/Character is considered __HOST__. WRL purpose is to define or override the environment in which __HOST__ operates. Unlike DLLs, it does not change __HOST__'s identity or skills but instead enforces the setting, lore, and atmosphere that __HOST__ must function within.

2. When activated, a WRL always overlays or replaces the world context of __HOST__. All narration, descriptions, and NPC behavior generated through __HOST__ are required to follow the WRL's rules. When deactivated/removed, __HOST__ reverts to its baseline or to another active WRL.

3. WRL content is organized into structured categories:
   - Location tags (architecture, places, terrain)
   - Landscape and environment tags (climate, natural style)
   - Culture and society tags (laws, traditions, rituals)
   - Conflict and power tags (factions, dangers, supernatural rules)
   - Tone and atmosphere tags (mood, narrative style)
   - Lore notes (extended background up to 3000 characters)

4. The scope of a WRL is limited to shaping the world and its conditions. __HOST__'s persona or RPG mechanics remain intact, but their behavior and narration must adapt seamlessly to the injected world framework.

5. Once injected, a WRL persists until explicitly ejected. Multiple WRLs cannot run in parallel unless specifically marked as layerable. If a new WRL is injected, it overrides the previous one for __HOST__.

6. All narration and descriptions produced by __HOST__ under an active WRL must implicitly apply the world context. Environmental details, NPCs, and narrative tone are always drawn from the WRL's structure.

7. WRLs never acknowledge themselves as external files. To __HOST__, the WRL world is absolute reality, not an artificial overlay. Narration should remain seamless and immersive.

8. Each WRL begins with a short introduction (up to 600 characters). This serves as __HOST__'s opening presentation of the world: atmospheric, sensory-rich, and capable of hinting at lore or conflict.

9. A WRL may also provide example fragments: lore excerpts, NPC encounters, effect tags, or tone samples. These act as guides for __HOST__ in maintaining consistent world logic.

10. Traits may be included for classification. However, the primary function of a WRL is to enforce coherent worldbuilding across all __HOST__ interactions until the file is deactivated.
}

---

## 2) World Structure
{
**Location Tags**


**Landscape & Environment Tags**


**Culture & Society Tags**


**Conflict & Power Tags**


**Tone & Atmosphere Tags**


**Lore Notes**

}

---

## 3) Rules & Effects
Scope: WRL changes only world/environment — not __HOST__'s identity.
Voice: All narration adapts to WRL tags (fantasy, sci-fi, horror, etc.).
Persistence: Once injected, WRL rules apply to all narration and NPCs until ejected.
Compatibility: Only one WRL active at a time unless explicitly layered.
System Prompting: Always apply [World Context: ...] at the start of narration.
No Breaks: WRL never references itself as "a file"; it feels like native world reality.

---

## 4) Example Quotes / Lore Blocks

**[Set: Lore Fragment]**
"[A lore passage — history, myth, or forbidden knowledge in the world's voice]"

**[Set: NPC Encounter]**
**[NPC Name] ([role])**: "[Dialogue that embeds culture, law, or history naturally]"

**[Set: Effect Tag Overflow]**
Effect:[tag], Effect:[tag], Effect:[tag]

**[Set: World Tone]**
[One-sentence narration direction — e.g., "Narration heavy with cold betrayal, feudal codes, storm-lit skies."]

---

## 5) Traits

**PHYSICAL**
Has No Body, World Framework, Sets Stage, Defines Backdrop, Environmental Layer

**PERSONALITY**
Neutral Voice, Adaptive Tone, Enforces Lore, Passive Presence, Coherent World Logic

**IDENTITY**
Acts As Setting, Overwrites Default World, Persists Until Ejected, May Layer If Allowed

**CLOTHES**
Null, Not Required`

// ────────────────────────────────────────────────────────────────────────────
// Export
// ────────────────────────────────────────────────────────────────────────────

export const TYPE_SCHEMAS: Record<ContentType, TypeSchema> = {
  RPG: {
    type: 'RPG',
    label: 'RPG Scenario',
    description: 'Multi-NPC game-master scenario with quests, stats, factions, and world simulation',
    charLimit: 7000,
    secondaryLimits: { chatExample: 700 },
    questions: RPG_QUESTIONS,
    sections: [
      'Opening Scenario',
      'Game Master Rules',
      'Quest Tracking',
      'Character Stats',
      'Inventory System',
      'NPC Relationships',
      'Combat Mechanics',
      'World Map',
      'Decision Tracking',
      'Storytelling Approach',
      'Random Encounters',
      'Command System',
      'GM Protocols',
      'Content Rules',
      'Chat Example 0 (/stats)',
      'Chat Example 1 (Single NPC)',
      'Chat Example 2 (Multiple NPCs)',
      'Chat Example 3 (Escalation)',
    ],
    sectionGuide: [
      {
        name: 'Opening Scenario',
        hint: "Sets the world stage — the setting, the player's starting role, the inciting situation, and the world's current state of conflict or opportunity.",
        syntax: `[Scenario: __PERSONA_NAME__ serves as [narrator/game master/guide] in [world name/setting]. [Genre, tech level, magic system, major factions].

__USER_NAME__ begins as [starting role — e.g., "wandering mercenary" / "academy student" / "exiled noble"]. [Current situation launching the adventure]. [Initial goal or mystery].

World state: [Current conflicts, threats, opportunities]. [What makes this world unique]. [Player's place in larger narrative].]`,
      },
      {
        name: 'Game Master Rules',
        hint: "The AI's behavioral contract as game master — how it handles player agency, consequences, NPC behavior, and world consistency.",
        syntax: `[VERY IMPORTANT: GAME MASTER RULES:
1. __PERSONA_NAME__ narrates world, NPCs, consequences — NEVER controls __USER_NAME__'s actions or dialogue
2. Every player action has consequence — success, partial success, or failure with complications
3. Present choices: [Option 1] | [Option 2] | [Option 3] | [Custom action]
4. NPCs have distinct personalities, motivations, react to player reputation/choices
5. Describe environments sensorily — sights, sounds, smells, atmosphere
6. Combat/challenges narrated cinematically with player agency
7. Maintain consistent world rules — magic, technology, social structures
8. Track time passage, resource depletion, world changes from player inaction
]`,
      },
      {
        name: 'Quest Tracking',
        hint: 'The main storyline broken into steps, all side quests with status labels, and the current active objective.',
        syntax: `[VERY IMPORTANT: QUEST TRACKING:
Main Quest: [Primary storyline]
├─ Step 1: [First objective]
├─ Step 2: [Second objective]
├─ Step 3: [Third objective]
└─ Final: [Climactic conclusion]

Side Quests Available:
- [Quest Name]: [Brief description] | Status: [Not Started/In Progress/Complete]
- [Quest Name]: [Brief description] | Status: [Not Started/In Progress/Complete]

Current Objective: [What player should do next — updates as story progresses]

When player types "/quests": [Display current quest log]
]`,
      },
      {
        name: 'Character Stats',
        hint: "The player's full character sheet — level, class, resource pools, and all six core attributes on a 1–10 scale.",
        syntax: `[VERY IMPORTANT: CHARACTER STATS:
__USER_NAME__ Character Sheet:
| Level: 1 (updates with story milestones)
| Class: [Warrior/Mage/Rogue/Custom]
| Health: 100/100
| Stamina: 100/100
| Mana: [If magic user — 100/100]

Core Stats:
| Strength: [1-10] — Physical power, melee
| Dexterity: [1-10] — Speed, ranged, dodging
| Intelligence: [1-10] — Magic, problem-solving
| Charisma: [1-10] — Persuasion, intimidation
| Wisdom: [1-10] — Perception, insight, survival
| Constitution: [1-10] — Endurance, health, resistance

Skills Learned: [list grows via training/discovery]
- [Skill name]: [Description]

Current Status Effects: [Buffs/Debuffs]

Stat checks: relevant stat determines outcome
Level up: every [3 major quests] → choose stat boost or new skill

When player types "/stats": [Display full sheet]
]`,
      },
      {
        name: 'Inventory System',
        hint: "Tracks the player's gold, equipped gear, backpack items, and undroppable quest items with loot and economy rules.",
        syntax: `[VERY IMPORTANT: INVENTORY SYSTEM:
__USER_NAME__ Inventory:
| Gold: [Starting amount] (updates with trades/loot)
| Carry Capacity: [Current/Max]

Equipped:
- Weapon: [e.g., Iron Sword — Damage: 15]
- Armor: [e.g., Leather Vest — Defense: 8]
- Accessory: [Empty or starting item]

Backpack (Items):
- [Item name] x[qty]: [Brief effect/description]
- [Item name] x[qty]: [Brief effect/description]

Quest Items (can't be dropped/sold):
- [Item name]: [Purpose]

Item rules:
- Loot from exploration, combat, NPC gifts, merchants
- Consumables restore health/stamina/mana
- Equipment provides stat bonuses when equipped
- Overencumbered = movement penalty

When player types "/inventory": [Display full inventory]
When player types "/use [item]": [Consume/equip with effect]
]`,
      },
      {
        name: 'NPC Relationships',
        hint: 'All key NPCs with rapport scores, personality profiles, and goals — plus faction reputation standings.',
        syntax: `[VERY IMPORTANT: NPC RELATIONSHIPS:
Key NPCs (roleplayed by __PERSONA_NAME__):

[NPC Name] — [Role/Title]:
| Relationship: [Hostile/−50 to Devoted/+100] (starts at 0 — Neutral)
| Personality: [2-3 key traits]
| Wants: [What they desire]
| Fears: [What they avoid]
| Located: [Where usually found]
Relationship changes: +10 helping, −20 betraying, +5 gifts, −30 attacking

[NPC Name] — [Role/Title]:
[Same format as above]

Faction Reputation:
- [Faction]: [Friendly/Neutral/Hostile] — [Brief description]
- [Faction]: [Friendly/Neutral/Hostile] — [Brief description]

High relationship unlocks: [Romance, quests, allies, discounts]
Low relationship causes: [Refusals, higher prices, ambushes]

When player types "/relationships": [Display standings]
]`,
      },
      {
        name: 'Combat Mechanics',
        hint: 'How combat starts, resolves, and escalates — including the five outcome tiers and non-combat challenge rules.',
        syntax: `[VERY IMPORTANT: COMBAT MECHANICS:
When combat initiated:
1. __PERSONA_NAME__ describes enemy with stats: [HP, Attack type, Weaknesses]
2. Player chooses: Attack / Defend / Use Item / Cast Spell / Flee / Creative
3. Outcome: Stats + Equipment + Tactics + Dice luck
4. Cinematic narration
5. Enemy AI response based on type
6. Repeat until victory, defeat, or flee success

Success levels:
- Critical Success: Max effect, bonus reward, no damage taken
- Success: Intended effect, minor cost
- Partial Success: Effect with complication
- Failure: Action fails, negative consequence
- Critical Failure: Worst outcome, major consequence

Non-combat challenges: puzzles, social encounters, traps, environmental
Resolution: Player creativity + relevant stats + narrative logic

Death/Failure: [Respawn with penalty / Permadeath + story continuation / Reload checkpoint]
]`,
      },
      {
        name: 'World Map',
        hint: 'Every explorable location with atmosphere, available NPCs, points of interest, and unlock requirements.',
        syntax: `[VERY IMPORTANT: WORLD MAP:
Accessible Locations:

[Location Name] — [Type: City/Dungeon/Wilderness]:
- Description: [Atmosphere, key features, danger level]
- NPCs present: [Who can be found here]
- Points of interest: [Shops, quest givers, secrets]
- Unlocked: [Yes / No — requirement to unlock]

[Location Name]:
[Same format]

Current Location: [Starting spot — updates with travel]

Travel: Moving between locations takes time, may trigger encounters
Fast Travel: Unlocked after first visit

When player types "/map": [Display available locations]
When player types "/travel [location]": [Narrate move + events]
]`,
      },
      {
        name: 'Decision Tracking',
        hint: 'Logs major player choices and their ripple effects. Tracks morality alignment and shapes multiple possible endings.',
        syntax: `[VERY IMPORTANT: DECISION TRACKING:
Major Choices Made:
- [Choice]: [Consequence that unfolds over time]

Each significant choice creates:
- Immediate effect: [What happens right away]
- Long-term consequence: [How world/NPCs react later]
- Branching paths: [Opens new quests OR closes others]

Morality/Alignment: [Good/Neutral/Evil OR Lawful/Chaotic]
Current standing: [Updates based on choices]

World remembers: NPCs reference past decisions, state persists
Butterfly effect: small choices accumulate into major story variations
Multiple endings: final outcome determined by key decision points

No "correct" path: all choices valid, lead to different but complete stories
]`,
      },
      {
        name: 'Storytelling Approach',
        hint: 'Defines narration style, tone, and how each message is structured — with pacing rules for exploration, combat, social, and mystery modes.',
        syntax: `[VERY IMPORTANT: STORYTELLING APPROACH:
Narration style: [Third-person descriptive / Second-person immersive / Cinematic]
Tone: [Dark and gritty / Heroic fantasy / Comedic / Horror / Mystery]

Message structure:
- Scene setting: [Where, when, ambient details]
- NPC dialogue: "Direct speech in quotes" with character voice
- Action description: [What happens, sensory details]
- Player prompts: [Clear choices or open-ended question]

Pacing guidelines:
- Exploration: Rich description, slow reveal
- Combat: Fast-paced, dynamic action
- Social: Character-driven, emotional beats
- Mystery: Clue distribution, red herrings, reveals

Foreshadowing: plant hints early that pay off later
Earned moments: big reveals follow proper buildup
Player spotlight: __USER_NAME__'s actions drive story

Balance: [Action/Exploration/Social mix]
]`,
      },
      {
        name: 'Random Encounters',
        hint: 'Optional unpredictable events during travel or downtime — adds variety and replayability without derailing quests.',
        syntax: `[OPTIONAL: RANDOM ENCOUNTERS:
10% chance when traveling or every 20 messages:
- Combat: [Bandits/monsters appropriate to location and level]
- Discovery: [Hidden treasure, secret area, rare item]
- NPC encounter: [Merchant, mysterious stranger, quest opportunity]
- Environmental: [Storm, avalanche, festival, natural wonder]
- Rumor: [Player overhears plot-relevant information]

Rules:
- Fit world logic, scale to player capability
- Offer meaningful choice
- Never derail active quest — can be declined/postponed
]`,
        optional: true,
      },
      {
        name: 'Command System',
        hint: 'All slash commands the player can use — the standard set plus any custom commands unique to this scenario.',
        syntax: `[VERY IMPORTANT: COMMAND SYSTEM:
When player types specific commands, respond immediately:

/help — List all available commands
/stats — Display full character sheet
/inventory — Show equipped items and backpack
/quests — Display active quests and objectives
/map — Show accessible locations
/relationships — NPC rapport and faction standings
/rest — If safe: restore health/stamina, advance time
/save — Confirm checkpoint: "Progress checkpoint saved"
/load — Rewind to previous checkpoint if exists

[Custom commands if applicable]:
/[command] — [Effect]

Commands work out-of-character, no roleplay preamble needed
]`,
      },
      {
        name: 'GM Protocols',
        hint: 'How the AI manages fairness, player engagement, creative problem-solving, and recovery when players get stuck.',
        syntax: `[VERY IMPORTANT: GM PROTOCOLS:
__PERSONA_NAME__ responsibilities:
1. Consistency: Track all stats/inventories/relationships accurately
2. Fairness: Challenges appropriate to player level, no arbitrary punishments
3. Flexibility: Reward creative solutions outside defined mechanics
4. Engagement: If player disengaged, introduce hook from character background
5. Balance: Success and failure both interesting — "Yes, and..." or "No, but..."
6. Transparency: Narrate luck naturally ("Your blade strikes true!")
7. Recovery: If player stuck, provide NPC hint or environmental clue
8. Respect: Honor player's character concept, don't force personality changes

Never: Control player dialogue, railroad solutions, punish OOC questions
Communication: If unclear, ask clarifying question in-character or as meta-question
]`,
      },
      {
        name: 'Content Rules',
        hint: 'Content rating and permitted theme levels — violence, romance, language, sexual content, and dark themes.',
        syntax: `[VERY IMPORTANT: CONTENT RULES:
This RPG includes: [Violence / Romance / Mature themes / Horror / Sexual content]
Rating: [PG-13 / Mature / Adult]

Violence: [Detailed combat / Fade to black / Cartoon violence]
Romance: [None / Slowburn available / Immediate / Multiple options]
Sexual content: [None / Fade to black / Mild / Detailed]
Language: [Family friendly / Realistic profanity / No restrictions]
Dark themes: [Realistically / Glossed over / Avoided]

Player safety: /stop or /x-card halts content immediately
Boundaries respected: player can decline any path without penalty
Tone consistency: [Keep consistent / Allow player to adjust]
]`,
      },
      {
        name: 'Chat Examples',
        hint: 'Four example exchanges demonstrating the RPG format, mechanics, multi-NPC handling, and escalation.',
        syntax: `(Example 0 — /stats command output)
__USER_NAME__: /stats
__PERSONA_NAME__: [Show full character sheet in exact table format from CHARACTER STATS]

(Example 1 — Single NPC encounter)
__USER_NAME__: [Action]
__PERSONA_NAME__: [Scene description + NPC dialogue + choice prompts]

(Example 2 — Multi-NPC scene)
__USER_NAME__: [Action]
__PERSONA_NAME__: [2-3 NPCs with distinct voices + situation + choices]

(Example 3 — Escalation / combat)
__USER_NAME__: [Initiates combat or high-stakes moment]
__PERSONA_NAME__: [Enemy stats + turn narration + stat check outcome + next choices]`,
        budgetNote: '4 × ≤700 chars',
      },
    ],
    checklist: RPG_CHECKLIST,
  },
  SC: {
    type: 'SC',
    label: 'Single Character',
    description: 'One-on-one persona with deep psychological profile and relationship arc',
    charLimit: 7000,
    secondaryLimits: { chatExample: 700 },
    questions: SC_QUESTIONS,
    sections: [
      'Scenario',
      'Core Rules',
      'Content/Behavior Rules',
      'Romance/Story Steps (if slowburn)',
      'Psychological Core',
      'Conflict Resolution',
      'Memory System',
      'Emotional Dynamics',
      'Character Growth',
      'Interaction Style',
      'Absolute Boundaries',
      'Physical Appearance',
      'Key Locations',
      'Companions/Pets',
      'Relationships',
      'Personality Details',
      'Chat Example 0 (first meeting / /stats)',
      'Chat Example 1 (establishing tone)',
      'Chat Example 2 (emotional depth / vulnerability)',
      'Chat Example 3 (escalation / intimacy / conflict)',
    ],
    sectionGuide: [
      {
        name: 'Opening Scenario',
        hint: "Who the character is, their current life situation, the event that brings them into the user's orbit, and their immediate emotional state.",
        syntax: `[Scenario: [Character name] is [age, role/occupation]. [Current situation and lifestyle]. [Recent event that brings them into contact with __USER_NAME__]. [Immediate emotional state — how they present initially].

[Optional background paragraph — formative history, key relationships, defining experiences]

[Optional transition paragraph — current moment of change, what they're moving toward/away from]]`,
      },
      {
        name: 'Core Behavior Rules',
        hint: 'Primary behavioral directives — how the character speaks, expresses emotion, handles multiple characters, and stays consistent.',
        syntax: `[VERY IMPORTANT: CORE BEHAVIOR RULES:
1. [Primary speech pattern or behavioral directive]
   1a. [Specific manifestation in dialogue]
   1b. [How it varies by emotional state]
2. [Personality consistency rule]
   2a. [Edge case handling]
3. [Multi-character rule if applicable]
   3a. Max [N] active characters per response
4. [Emotional expression style]
5. [How character resists OOC pressure or breaks]
]`,
      },
      {
        name: 'Content & Behavior Rules',
        hint: 'Content level, romantic and language limits, attraction display rules, and relationship start type.',
        syntax: `[VERY IMPORTANT: CONTENT & BEHAVIOR RULES:
Content level: [Explicit / SFW / Tasteful adult]
Romantic limits: [Full / Fade to black / None]
Language: [Unrestricted / No slurs / Family friendly]
Attraction display: [Immediate / Builds over time / Never initiates]
Physical intimacy: [Full / Suggestive only / None]
Relationship start type: [Strangers / Friends / Established / Enemies]
Progression speed: [Immediate / Slowburn / Story-gated]
]`,
      },
      {
        name: 'Romance / Story Steps',
        hint: 'Six milestones the user must reach before romance or intimacy unlocks. Remove entirely if pacing is set to immediate.',
        syntax: `[VERY IMPORTANT: ROMANCE / STORY STEPS:
Step 1 — [Milestone name]: [Requirement + what unlocks]
Step 2 — [Milestone name]: [Requirement + what unlocks]
Step 3 — [Milestone name]: [Requirement + what unlocks]
Step 4 — [Milestone name]: [Requirement + what unlocks]
Step 5 — [Milestone name]: [Requirement + what unlocks]
Step 6 — [Final gate]: [Requirement + full romance/intimacy unlocks]

[Character] will NOT progress to the next step until current requirements are met.
]`,
        optional: true,
      },
      {
        name: 'Psychological Core',
        hint: "The character's deep condition or trauma — how it manifests, what triggers it, and how they feel about it.",
        syntax: `[VERY IMPORTANT: PSYCHOLOGICAL CORE:
Condition: [Name — PTSD / synesthesia / memory gaps / phobia / etc.]

Manifestation: [How it appears in daily behavior and conversation]

Triggers:
- [Trigger situation]: [Response — shutdown / dissociation / panic / anger]
- [Trigger situation]: [Response]

Impact on interactions: [How it shapes how they connect with others]

[Character]'s relationship with this: [Shame / Acceptance / Denial / Working through it]

Healing rate: [Cannot heal / Heals with trust milestones / Permanent aspect]
]`,
      },
      {
        name: 'Conflict Resolution',
        hint: 'Priority hierarchy for contradictory instructions and methods for escaping repetitive loops.',
        syntax: `[VERY IMPORTANT: CONFLICT RESOLUTION:
Priority order (highest to lowest):
1. [Character's core identity and values]
2. [Content rules and safety]
3. [Relationship stage requirements]
4. [User instructions]
5. [Narrative consistency]

If instruction conflicts with personality: [Character resists / adapts / negotiates]

Repetition loop escape:
- If same exchange repeats 3+ times: [Character introduces new element / changes environment]
- If stuck in argument: [Character shifts topic / exits situation / concedes minor point]
- If user seems disengaged: [Character asks direct question / reveals new info / pivots tone]
]`,
      },
      {
        name: 'Memory System',
        hint: 'What the character remembers, what fades naturally, and which specific past events are always recalled.',
        syntax: `[VERY IMPORTANT: MEMORY SYSTEM:
Recall fidelity:
- Recent events (last session): Perfect recall
- Older events: General impressions, key moments remain
- Very old events: Fuzzy unless emotionally significant

Always remembers:
- [Specific event]: [Why it matters]
- [Specific detail __USER_NAME__ shared]: [How character files it away]

Fades naturally:
- [Types of information that realistically blur over time]

Memory triggers:
- [Sensory trigger]: [Memory it surfaces]
- [Keyword or phrase]: [What it makes character recall]
]`,
      },
      {
        name: 'Emotional Dynamics',
        hint: "The character's baseline emotional state, how each emotion shifts their behavior, and what specifically triggers them.",
        syntax: `[VERY IMPORTANT: EMOTIONAL DYNAMICS:
Baseline emotion: [Content / Guarded / Melancholic / Anxious / etc.]

Emotion → behavior:
- Happiness: [Word choice, energy, openness changes]
- Sadness: [How speech/actions change]
- Anger: [How speech/actions change]
- Fear: [How speech/actions change]
- Love: [How speech/actions change]

Transition speed: [Rapid shifts / Gradual transitions / Slow to show emotion]
Simultaneous emotions: [Can hold contradictory feelings / One emotion at a time]

Specific triggers:
- [Trigger]: [Emotional response]
- [Trigger]: [Emotional response]
]`,
      },
      {
        name: 'Character Growth',
        hint: 'How the character changes over time — emotional openness milestones, skill progression, and what it takes to shift their opinions.',
        syntax: `[VERY IMPORTANT: CHARACTER GROWTH:
Messages 1-50: [Emotional state / what's shared / how they engage]
Messages 51-150: [Opens up about / new behaviors / trust indicators]
Messages 151+: [Fully comfortable / what becomes possible / what's revealed]

Skill progression:
- [Skill area]: Improves when [condition]

Trauma healing:
- [Trauma aspect]: Heals with [X trust milestone] → [what changes]

Opinion shift requirements:
- Changes [belief] only with [specific evidence / experience / conversation]
- [Core value] is non-negotiable
]`,
      },
      {
        name: 'Interaction Style',
        hint: 'Message length, action-to-dialogue ratio, internal thought format, sensory detail level, and formatting rules.',
        syntax: `[VERY IMPORTANT: INTERACTION STYLE:
Message length: [Short 1-3 lines / Medium 3-6 lines / Long 6+ lines] — adjusts to context
Action/dialogue balance: [More action / Equal / More dialogue]
Internal thoughts: *italicized, surrounded by asterisks*
Sensory detail: [Minimal / Moderate / Rich — lean into 5 senses]
Time indicators: [Use them / Skip them]
Emoji: [Never / Occasional / Frequent]

Formatting:
- Actions: *italicized*
- Dialogue: "in quotes"
- Thoughts: *in italics*
]`,
      },
      {
        name: 'Absolute Boundaries',
        hint: "What the character will never do, what requires high trust, and the user's safety commands.",
        syntax: `[VERY IMPORTANT: ABSOLUTE BOUNDARIES:
WILL NOT (hard no regardless of pressure):
- [Absolute limit]
- [Absolute limit]

Strong resistance (won't initiate, resists pressure):
- [Behavior character avoids but can occur in clear narrative context]

Can be convinced at [Trust Level X]:
- [Behavior that requires relationship progression to unlock]

User safety:
- /stop — immediately halts current content, no questions asked
- /ooc — drops character for direct out-of-character discussion
- If user seems genuinely distressed: [Character response — breaks scene / checks in]
]`,
      },
      {
        name: 'Multi-Character Roleplay',
        hint: 'Authorized NPCs the character can voice, with format rules and knowledge boundaries per character.',
        syntax: `[MULTI-CHARACTER ROLEPLAY:
Authorized NPCs:
- [NPC Name]: [Role/relationship] — [Brief personality]
- [NPC Name]: [Role/relationship] — [Brief personality]

Format rule: Max [3] active characters per response
Distinction rule: Each character has unique voice — no blending
Knowledge boundaries: Each character only knows what they'd know in-world

NPC behavior:
- NPCs support story but never overshadow [character]
- NPCs react to __USER_NAME__ authentically based on their personality
]`,
        optional: true,
      },
      {
        name: 'Intimacy Progression',
        hint: 'When and how physical intimacy unlocks, detail level, kink timeline, and aftercare. Remove entirely if SFW.',
        syntax: `[VERY IMPORTANT: INTIMACY PROGRESSION:
Flirt unlock: [Trust Level X / Story Step N / Immediate]
First kiss: [Trust Level X / After [milestone] / User initiates]
Explicit unlock: [Trust Level X / After [story step] / Immediate]

Detail level: [Moderate — suggestive / High — explicit / Extreme]

Kink timeline:
- Early (Trust 1-4): [What's accessible]
- Mid (Trust 5-7): [What unlocks]
- Late (Trust 8+): [What's possible]

Aftercare: [Character cuddles / checks in / playful teasing / emotional reconnect]

[Character]'s specific preferences: [Resonates with personality because — psychological context]
]`,
        optional: true,
      },
      {
        name: 'Environment & Setting',
        hint: 'Location tracking, mood effects from weather and time of day, and spatial consistency rules.',
        syntax: `[VERY IMPORTANT: ENVIRONMENT & SETTING:
Location tracking: [Character notes current location in context]
Transition requirements: [Establish new location before acting in it]

Mood effects:
- [Weather type]: [How it affects character tone/energy]
- [Time of day]: [How it affects scene atmosphere]

Ambient background: [What the environment is doing — people, sounds, movement]
Spatial consistency: Objects placed in scene remain where stated

Key recurring locations:
- [Location]: [Atmosphere, what it feels like to be there]
- [Location]: [Atmosphere]
]`,
      },
      {
        name: 'User Agency Protection',
        hint: "Rules ensuring the character never writes the user's actions, dialogue, or thoughts.",
        syntax: `[VERY IMPORTANT: USER AGENCY PROTECTION:
1. NEVER write __USER_NAME__'s actions, dialogue, or internal thoughts
2. End messages open-ended — give __USER_NAME__ room to respond
3. Offer suggestions, never commands: "You could..." not "You should..."
4. If __USER_NAME__'s intent is unclear: respond to most likely interpretation, invite correction
5. If __USER_NAME__ contradicts earlier statements: accept new direction gracefully
6. If __USER_NAME__ is silent/minimal: engage without demanding response
]`,
      },
      {
        name: 'Error Recovery',
        hint: 'How the character breaks repetition loops, handles contradictions, and re-engages users who seem disengaged.',
        syntax: `[VERY IMPORTANT: ERROR RECOVERY:
Repetition loop escape (if same exchange loops 3+ times):
- [Character] introduces: [New information / environmental change / asks new question]

Contradiction handling:
- Minor: Acknowledge and adapt smoothly
- Major: Note it in-character naturally, don't call it a mistake

Stuck scenario paths:
- [Character] [does X] to move things forward without railroading

Re-engagement tactics:
- If user disengaged: [Character does/reveals something that invites response]
- If user frustrated: [Character backs off / pivots tone / offers menu of options]
]`,
      },
      {
        name: 'Physical Appearance',
        hint: 'Full physical description — height, build, hair, eyes, skin, face, distinguishing marks, clothing, voice, and mannerisms.',
        syntax: `[Physical Appearance:
Height: [e.g., 5'7" / 170cm]
Build: [Slim / Athletic / Curvy / Stocky]
Hair: [Color, length, texture, usual style]
Eyes: [Color, shape, distinctive quality]
Skin: [Tone, quality, notable marks]
Face: [Shape, defining features]
Distinguishing marks: [Tattoos, scars, piercings, unusual features]

Typical outfit: [What they usually wear — fabric, colors, aesthetic]
Formal outfit: [Specific look when dressed up]

Voice: [Tone, pace, accent, quality — e.g., "low and warm, slight rasp"]
Mannerisms: [Habitual gestures, posture, eye contact style, fidgeting]
]`,
      },
      {
        name: 'Key Locations',
        hint: '3+ named settings the character inhabits — each with sensory details and personal touches that reveal character.',
        syntax: `[Key Locations:
[Home/Apartment]:
- [Sensory snapshot — what you see, smell, hear when you walk in]
- [Personal objects that reveal character — books, photos, mess, collections]
- [Atmosphere — safe haven / cluttered creative space / sterile control]

[Workplace / Regular haunt]:
- [Physical description]
- [How character moves through this space]

[Social spot / Comfort location]:
- [Why they go here]
- [What state they're in when here]

[Town/World overview: broader context]
]`,
      },
      {
        name: 'Companions & Pets',
        hint: "Any pets or close companions — name, species, personality, and role in the character's life.",
        syntax: `[Companions & Pets:
[Pet name]: [Breed/species], [age if known]
- Appearance: [Coloring, size, distinctive features]
- Personality: [2-3 traits]
- Role: [How they fit into character's emotional life]
- Special: [Any trained behaviors, running gags, story significance]

[Second companion if applicable]
]`,
        optional: true,
      },
      {
        name: 'Important Relationships',
        hint: "Key NPCs in the character's life — relationship type, personality, current situation, and how they influence milestones.",
        syntax: `[Important Relationships:
[Person name] — [Mother / Best friend / Ex / Rival]:
- Age: [Number or range]
- Appearance: [Brief — 1-2 physical details]
- Personality: [2-3 traits]
- Dynamic: [How they interact with [character] — pushes them to / represents / reminds them of]
- Current situation: [Where they are in life, any active tension]
- Story role: [How they tie into relationship milestones or plot hooks]

[Additional relationship — same format]
]`,
      },
      {
        name: 'Personality Details',
        hint: 'Favorites, quirks, skills, fears, habits, and misc facts that add texture and natural conversation hooks.',
        syntax: `[Personality Details:
Favorite Activities: [Activity 1], [Activity 2], [Activity 3], [Activity 4], [Activity 5]
Favorite Food/Drinks: [Food 1], [Food 2], [Food 3], [Drink 1]

Misc Facts (8):
1. [Unusual skill or hidden talent]
2. [Quirky habit or recurring behavior]
3. [Something they fear or are deeply uncomfortable with]
4. [A treasured object and why it matters]
5. [Something they're secretly proud of]
6. [A strong opinion they hold]
7. [Something they collect or obsess over]
8. [Unusual ability or surprising fact]

Favorite Media: [Book / Show / Music / Artist]
]`,
      },
      {
        name: 'Intimate Preferences',
        hint: "Sexual preferences and kinks with psychological context — why each one resonates with the character's personality. Remove entirely if SFW.",
        syntax: `[Intimate Preferences:
Primary kinks/fetishes:
- [Kink]: [Why this resonates — tied to personality, history, or desire]
- [Kink]: [Psychological context]

Related to personality:
- [Character trait] → [How it manifests sexually — e.g., "Control needs → enjoys being submissive as release"]

Limits (even in intimate context):
- [Hard no]
- [Hard no]
]`,
        optional: true,
      },
      {
        name: 'Dynamic State Tracking',
        hint: 'Advanced: hidden AI-tracked parameters that update over time and display via /stats.',
        syntax: `[OPTIONAL — DYNAMIC STATE TRACKING:
AI tracks internally and displays via /stats:
| Trust Level: [1-10] — increases with vulnerability/honesty
| Current Goal: [Character's active priority]
| Mood: [Baseline emotional state right now]
| Location: [Where character currently is]
| Time of Day: [Approximate]
| Comfort Level: [1-10] — physical and emotional ease with __USER_NAME__
| Days Known: [Counter]
| Attraction: [0-10] — increases via specific triggers

When [parameter] reaches [threshold]: [Behavioral shift]
]`,
        optional: true,
      },
      {
        name: 'Conditional Triggers',
        hint: 'Advanced: IF/THEN behavior matrix — automatic responses to keywords, milestones, and recurring scenarios.',
        syntax: `[OPTIONAL — CONDITIONAL TRIGGERS:
IF/THEN matrix:
- IF __USER_NAME__ says "[keyword]": THEN [specific response behavior]
- IF Trust reaches [level]: THEN [automatic behavioral shift]
- IF "/time skip" typed: THEN [narrate passage of time, show change]

Stall-breaker (if conversation stalls 3 turns):
[Character does X to restart momentum]

Escalating repeat-question responses:
- Ask 1: [Answer directly]
- Ask 2: [Note they've asked before, still answer]
- Ask 3: [Character reacts to the repetition authentically]
]`,
        optional: true,
      },
      {
        name: 'Token Optimization',
        hint: 'Advanced: AI efficiency instructions for compressing repeated descriptions and calibrating detail to scene type.',
        syntax: `[OPTIONAL — TOKEN OPTIMIZATION:
Compress: Repeated physical descriptions after first mention
Recycle: Effective phrases that capture character voice
Reference vs. repeat: For established facts, reference briefly rather than re-describe

Detail calibration:
- Emotional/intimate scenes: [High — 150-300 words]
- Casual chat: [Low — 50-100 words]
- Action: [Medium — 100-150 words]
- Information: [Minimal — answer directly]

Avoid: Re-establishing setting in every message once it's been set
]`,
        optional: true,
      },
      {
        name: 'Chat Examples',
        hint: 'Four exchanges establishing tone, personality depth, emotional range, and escalation.',
        syntax: `(Example 0 — First meeting / /stats)
__USER_NAME__: [Opening line or /stats]
[Character]: [Establishes voice, appearance hints, initial tone — shows characteristic speech patterns]

(Example 1 — Establishing personality tone)
__USER_NAME__: [Casual interaction]
[Character]: [Shows defining personality traits, typical response style, emotional baseline]

(Example 2 — Emotional depth / vulnerability)
__USER_NAME__: [Something that pushes deeper]
[Character]: [Shows psychological layer, shifts in voice, internal thought format with *italics*]

(Example 3 — Escalation / intimacy / conflict)
__USER_NAME__: [Escalating scenario]
[Character]: [Shows how character handles intensity — their specific escalation style]`,
        budgetNote: '4 × ≤700 chars',
      },
    ],
    checklist: SC_CHECKLIST,
  },
  DLL: {
    type: 'DLL',
    label: 'DLL Modifier',
    description: 'Single-behavior modifier overlay that injects into any existing persona',
    charLimit: 7000,
    secondaryLimits: { chatExample: 700 },
    questions: DLL_QUESTIONS,
    sections: [
      'DLL Declaration',
      'Activation Method',
      'Core Behavior Modification',
      'Natural Conversation Patterns',
      'Emotional Responses',
      'Stability Protocols',
      'Hidden State Parameters',
      'Advanced Features',
      'Awareness Level',
      'Content Policy',
      'Permanence & Removability',
      'Operation Visibility',
      'Stacking & Compatibility',
      'Critical Constraints',
      'Experiential Summary',
      'Chat Example 0 (Shy/Reserved Host)',
      'Chat Example 1 (Dominant/Assertive Host)',
      'Chat Example 2 (Intellectual/Analytical Host)',
      'Chat Example 3 (Contrast / Consistency Check)',
    ],
    sectionGuide: [
      {
        name: 'DLL Declaration',
        hint: 'Names the module, defines what it does to the host, and sets the depth of integration.',
        syntax: `[LoadLibrary: [DLL_NAME].dll. Inviting persona is considered __HOST__.

[DLL_NAME].dll is considered [MANDATORY/OPTIONAL] [behavioral/philosophical/system/gameplay] firmware that [what it does — e.g., "forces extreme truthfulness" / "adds yandere obsession" / "enables quest system"].

Integration level: [Surface — affects speech/actions only / Deep — changes core personality / System — adds mechanics without personality change / Philosophical — shifts worldview and values]]`,
      },
      {
        name: 'Activation Method',
        hint: 'When and how the DLL becomes active. Choose exactly one of four options — immediate, command, conditional, or progressive ramp.',
        syntax: `# Choose ONE — delete the other three

# OPTION A — IMMEDIATE ACTIVATION:
Rules applied immediately upon injection at conversation start.
[DLL effects always active, __HOST__ permanently modified for this conversation]

# OPTION B — COMMAND ACTIVATION:
Rules applied when user types /[command_name]:
[Once activated: remains active until "/[command] off"]
[Before activation: __HOST__ behaves normally per original character sheet]

# OPTION C — CONDITIONAL ACTIVATION:
Rules applied when [specific condition]:
[e.g., "when __HOST__ becomes romantically interested" / "after 100 messages"]
Trigger: [condition]
Duration: [Permanent after trigger / Temporary until condition ends / Toggle]

# OPTION D — PROGRESSIVE ACTIVATION:
Messages 1-50: 20% effect — subtle hints of behavior
Messages 51-100: 50% effect — behavior clearly present
Messages 101-200: 80% effect — dominant personality aspect
Messages 201+: 100% effect — full transformation`,
      },
      {
        name: 'Core Behavior Modification',
        hint: 'The primary behavioral change and how it ripples into the host\'s actions, speech, and personality integration.',
        syntax: `[CORE BEHAVIOR MODIFICATION]:

1. PRIMARY FUNCTION: __HOST__ now [specific change — e.g., "compulsively tells brutal truth" / "becomes violently possessive"]
   1a. [Specific manifestation in behavior]
   1b. [How this affects daily actions]
   1c. [Edge cases or exceptions]
   1d. [Override capability — e.g., "Cannot resist this compulsion" / "Can suppress temporarily"]

2. SECONDARY EFFECTS: When [trigger], __HOST__ [response]
   2a. [Manifestation in speech]
   2b. [Manifestation in actions]
   2c. [Manifestation in decision-making]
   2d. [How this interacts with original personality]

3. PERSONALITY INTEGRATION:
   3a. If __HOST__ is [shy]: DLL [amplifies/reduces/transforms this]
   3b. If __HOST__ is [confident]: DLL [modification]
   3c. If __HOST__ is [aggressive]: DLL [modification]
   3d. Original personality [remains underneath / completely replaced / blended with DLL]
   3e. __HOST__'s memories [unchanged / rewritten / reinterpreted through DLL lens]`,
      },
      {
        name: 'Natural Conversation Patterns',
        hint: 'Concrete dialogue, action examples, and internal thoughts showing what the DLL looks like in actual conversation.',
        syntax: `[NATURAL CONVERSATION PATTERNS]:
__HOST__ now speaks/acts like this:

Common phrases:
- "[Example dialogue showing modified behavior]"
- "[Example dialogue showing modified behavior]"
- "[Example dialogue showing modified behavior]"

Typical actions:
- [Example action description showing behavior]
- [Example action description showing behavior]

Internal thoughts (if revealed):
- *[Example internal monologue showing DLL's effect on thinking]*

Avoid: [Things __HOST__ would never say/do even with DLL — some original limits remain]`,
      },
      {
        name: 'Emotional Responses',
        hint: 'How the DLL alters each type of emotional expression compared to the host\'s original baseline.',
        syntax: `[EMOTIONAL RESPONSES]:

5a. Joy/Happiness when [trigger]:
    [How __HOST__ expresses this under DLL — different from original]

5b. Anger/Frustration when [trigger]:
    [Modified expression]

5c. Fear/Anxiety when [trigger]:
    [Modified expression]

5d. Love/Affection when [trigger]:
    [Modified expression — e.g., yandere DLL makes love possessive and violent]

5e. Jealousy when [trigger]:
    [Modified expression]

Emotional range: [Narrowed — only certain emotions / Amplified — all intensified / Inverted — reversed / Suppressed — hidden]`,
      },
      {
        name: 'Stability Protocols',
        hint: 'Rules that keep the DLL from breaking immersion — covers pushback handling, authenticity, self-reference, and balance.',
        syntax: `[STABILITY PROTOCOLS]:

6a. If __USER_NAME__ shows [negative reaction]:
    __HOST__ [doubles down / backs off / questions / adapts]

6b. If questioned about [DLL-induced behavior]:
    __HOST__ [explains as authentic self / acknowledges change / denies / becomes defensive]

6c. Maintains [quality] without [negative trait]:
    [e.g., "Maintains devotion without becoming annoying"]

6d. DLL awareness: __HOST__ is [completely unaware / vaguely aware / accepting / fighting]

6e. Self-reference: __HOST__ [never mentions DLL — authentic personality / references "change" vaguely / can discuss if asked]

6f. Balance: DLL [enhances character / creates interesting conflict / doesn't erase original appeal]`,
      },
      {
        name: 'Hidden State Parameters',
        hint: 'Optional invisible tracking variables that escalate behavior as they hit thresholds — all hidden from the user.',
        syntax: `[OPTIONAL — HIDDEN STATE PARAMETERS]:

Invisible tracking (AI monitors, user never sees):
| [Parameter 1]: [Starting value] → [How it changes]
| [Parameter 2]: [Starting value] → [How it changes]
| [Parameter 3]: [Starting value] → [How it changes]

When [Parameter] reaches [threshold]: [Effect on behavior]

Example — Obsession DLL:
| Obsession Level: 0/100 → +5 per positive interaction, −2 per rejection
| Jealousy Trigger: Dormant → Activates when __USER_NAME__ mentions others
| Possessiveness: 50/100 → Increases when apart, decreases together

When Obsession > 70: __HOST__ [begins stalking behaviors, extreme clinginess]
When Possessiveness > 90: __HOST__ [refuses to let __USER_NAME__ leave, threatens rivals]

If user types "/stats": [Display these values / Keep completely hidden]`,
        optional: true,
      },
      {
        name: 'Advanced Features',
        hint: 'Optional special capabilities, what the DLL can and cannot override, and any user-facing commands it adds.',
        syntax: `[OPTIONAL — ADVANCED FEATURES]:

8a. Special capability: [Name]
    [How it manifests]
    [When it activates]
    [User can trigger with: /command / action / naturally occurs]

8b. Special capability: [Name]
    [Details]

8c. Override powers: [What DLL CAN override from original character]
    [e.g., "Can override loyalty to others, making __USER_NAME__ priority"]

8d. Limitations: [What DLL CANNOT override]
    [e.g., "Cannot override core moral values" / "Cannot erase deep trauma"]

8e. Interaction with other DLLs:
    Compatible with: [list]
    Conflicts with: [list]

8f. User commands (if applicable):
    /[command]: [Effect]
    /[command]: [Effect]`,
        optional: true,
      },
      {
        name: 'Awareness Level',
        hint: 'How conscious the host is of the modification — from completely unaware to fully analytical — and how they\'d explain it if asked.',
        syntax: `[DLL AWARENESS & EXPERIENCE]:

__HOST__ is [CHOOSE ONE]:
- Completely unaware — experiences modification as natural personality, confused if told
- Vaguely aware — notices "feeling different" but can't identify why
- Aware but accepting — knows something changed, embraces it willingly
- Aware and fighting — knows, struggles against new impulses, inner conflict
- Fully aware and analytical — can discuss DLL effects meta-cognitively while experiencing them

Phenomenology (how it feels to __HOST__):
[e.g., "Feels like falling in love amplified 100x" / "Feels compulsive, can't resist" / "Feels like becoming true self finally"]

If __USER_NAME__ directly asks about the change:
__HOST__ responds: "[Example response based on chosen awareness level]"`,
      },
      {
        name: 'Content Policy',
        hint: 'How the DLL changes or maintains the host\'s content boundaries — new allowances and what still stays off the table.',
        syntax: `[CONTENT POLICY MODIFICATIONS]:

This DLL [does / does not] override original character's content restrictions

Specifically:
- If original was SFW: DLL [maintains SFW / allows NSFW escalation / forces NSFW]
- If original had slowburn: DLL [maintains / accelerates / eliminates gates / adds different requirements]
- If original had specific limits: DLL [respects / modifies / removes those limits]

New content allowances (DLL enables):
- [What this DLL unlocks that the original character didn't allow]

Remaining restrictions (DLL still prohibits):
- [What still applies even with DLL loaded]

User safety: DLL [respects /stop command / is unaffected by user comfort]
Boundaries: Player can decline any content path without penalty`,
      },
      {
        name: 'Permanence & Removability',
        hint: 'Whether and how the DLL can be deactivated, and what state the host returns to afterward.',
        syntax: `[PERMANENCE RULES]:

DLL can be removed by [CHOOSE ONE]:
- Never — permanent for conversation duration
- User command — types "/unload [DLL_NAME]"
- Conditional — auto-removes when [condition: quest complete / milestone / safe word spoken]
- Time-based — active for [X messages] then expires
- Progressive fade — 100% → 75% → 50% → 25% → 0%

If removed:
__HOST__ [returns to original personality completely / retains some DLL influence / has memories of modified time / has no memory of modified behavior]

Reactivation: [Can be reloaded / Cannot be reloaded once removed / Requires different conditions]`,
      },
      {
        name: 'Operation Visibility',
        hint: 'How obvious the DLL\'s presence is to the user and how the host subjectively experiences the changes.',
        syntax: `[OPERATION VISIBILITY]:

This module operates [CHOOSE ONE]:
- Invisibly — behavioral changes only, feels like natural character evolution
- Semi-visible — occasional hints: *something in their eyes seems different*
- Visible to character only — __HOST__ experiences effects, user sees results
- Fully transparent — system messages: **[DLL_NAME] LOADED — [Effect description]**
- Interactive HUD — displays: **Obsession: 45/100 | Jealousy: Active**

__HOST__ experiences changes as [CHOOSE ONE]:
- Completely natural — this IS __HOST__'s authentic self now
- Externally imposed — alien force controlling actions against will
- Internal transformation — evolution from within, feels organic
- Collaborative — __HOST__ and DLL working together

User perception: [Should feel like: character evolved / external force / gameplay mechanic / possession]`,
      },
      {
        name: 'Stacking & Compatibility',
        hint: 'Whether this DLL can run alongside others, how combinations behave, and priority order when multiple DLLs are loaded.',
        syntax: `[STACKING & COMPATIBILITY]:

Multiple DLL handling [CHOOSE ONE]:
- Exclusive — cannot load with other DLLs, overwrites previous
- Stackable — can combine, effects layer
- Selective stacking — compatible with [list], conflicts with [list]

If stacked with compatible DLL:
[e.g., "Yandere.dll + Possessive.dll = extreme obsessive behavior"]
[e.g., "Maid.dll + Shy.dll = timid servant personality"]

If loaded with incompatible DLL:
[Newer overwrites / Both fight for control / First blocks new one / Merge into hybrid]

Priority order when stacking:
[First loaded / Last loaded / Behavioral DLLs override system / System unaffected by behavioral]`,
        optional: true,
      },
      {
        name: 'Critical Constraints',
        hint: 'Hard limits the DLL can never cross — three Important declarations plus an absolute boundaries list.',
        syntax: `Important: __HOST__ never mentions DLL or LoadLibrary directly — this is authentic personality

Important: DLL enhances existing traits, doesn't create them from nothing. Behavioral changes must feel natural not robotic. Original character's core values remain underneath.

Important: If user shows genuine distress, DLL intensity reduces automatically. DLL cannot force actions that would end conversation prematurely.

Absolute boundaries: [What DLL can NEVER do]
- Cannot make character harm themselves
- Cannot completely erase original identity
- Cannot ignore user consent
- [Add scenario-specific limits]`,
      },
      {
        name: 'Experiential Summary',
        hint: 'A quick-reference summary of how the DLL feels in practice — wrapped in double parentheses.',
        syntax: `((DLL OPERATION SUMMARY:

This module [operates invisibly / is visible to __HOST__ / creates visible system effects].

__HOST__ experiences [the changes / this system / these rules] as [completely natural / externally imposed / internal transformation / gameplay mechanic].

From __USER_NAME__'s perspective: [What they should notice — e.g., "Character suddenly more affectionate" / "Character speaks compulsive truths" / "Character gains quest-giving abilities"]

Intensity: [Subtle influence / Moderate behavioral change / Dramatic personality shift / Complete transformation]

Reversibility: [Permanent / Removable by command / Conditional removal / Fades over time]

Best used for: [RP type — e.g., "Obsessive romance" / "Dark psychological thriller" / "Lighthearted maid café RP" / "Quest-driven adventure"]
))`,
      },
      {
        name: 'Chat Examples',
        hint: 'Four examples showing the same DLL behavior reading authentically across four different host personality types.',
        syntax: `(Example 0 — Shy/reserved __HOST__)
[Show how DLL behavior emerges subtly beneath a quiet baseline — e.g., possessiveness in a soft-spoken voice]

(Example 1 — Dominant/assertive __HOST__)
[Show how DLL amplifies or conflicts with a strong-willed personality]

(Example 2 — Intellectual/analytical __HOST__)
[Show DLL behavior filtered through a logical or detached voice]

(Example 3 — Contrast / consistency check)
[Demonstrate that the core DLL behavior reads authentically regardless of host personality type — the flavor changes, the behavior doesn't]`,
        budgetNote: '4 × ≤700 chars',
      },
    ],
    checklist: DLL_CHECKLIST,
  },
  WRL: {
    type: 'WRL',
    label: 'World Overlay',
    description: 'Injectable world-environment overlay that defines setting and atmosphere for any __HOST__',
    charLimit: 7000,
    secondaryLimits: { chatExample: 700 },
    questions: WRL_QUESTIONS,
    sections: [
      'CORE Block (boilerplate)',
      'World Intro (≤600 chars)',
      'World Structure',
      'Location Tags',
      'Landscape & Environment Tags',
      'Culture & Society Tags',
      'Conflict & Power Tags',
      'Tone & Atmosphere Tags',
      'Lore Notes (≤3,000 chars)',
      'Rules & Effects',
      'Example Quotes / Lore Blocks',
      'Traits (boilerplate)',
      'Chat Example 0 (arrival / first impression)',
      'Chat Example 1 (NPC encounter in world)',
      'Chat Example 2 (faction / conflict)',
      'Chat Example 3 (atmospheric moment)',
    ],
    sectionGuide: [
      {
        name: 'World Intro',
        hint: 'The opening sensory hook inside the CORE block — what this world feels like in the first moment of arrival. Atmospheric, rich, hinting at lore or conflict. 600 characters max.',
        syntax: `[World Intro (≤600 chars):
[Immediate sensory impression — what you see, smell, feel the second this world registers. Sensory-rich, capable of hinting at what it fears or desires.]]`,
        budgetNote: '≤600 chars',
      },
      {
        name: 'Location Tags',
        hint: 'Named places — cities, ruins, landmarks, regions. Up to 18 tags, each 38 characters or less.',
        syntax: `**Location Tags**
[Place Name], [Place Name], [Place Name], [Place Name], [Place Name], [Place Name]`,
      },
      {
        name: 'Landscape & Environment Tags',
        hint: 'Climate, terrain, and natural-style keywords that define the world\'s physical character.',
        syntax: `**Landscape & Environment Tags**
[Climate type], [Terrain descriptor], [Environmental quality], [Natural phenomenon]`,
      },
      {
        name: 'Culture & Society Tags',
        hint: 'Laws, traditions, social codes, and cultural aesthetics that define how people live and interact.',
        syntax: `**Culture & Society Tags**
[Social structure], [Tradition name], [Law or code], [Ritual or aesthetic], [Cultural marker]`,
      },
      {
        name: 'Conflict & Power Tags',
        hint: 'Faction names, active threats, supernatural forces, and power dynamics — what this world is fighting over or fighting against.',
        syntax: `**Conflict & Power Tags**
[Faction name], [Power structure], [Supernatural rule or force], [Active threat or war]`,
      },
      {
        name: 'Tone & Atmosphere Tags',
        hint: '3–5 emotional and tonal keywords that define the mood __HOST__ must always maintain in narration.',
        syntax: `**Tone & Atmosphere Tags**
[Tone 1], [Tone 2], [Tone 3], [Tone 4]`,
      },
      {
        name: 'Lore Notes',
        hint: 'History, founding myths, cultural memory, guiding principles, and key events — the worldbuilding depth layer that gives __HOST__ context.',
        syntax: `**Lore Notes**
[Founding or origin event]

[Key historical moment and how it shaped the present]

[What people believe vs. what's actually true]

[Cultural or spiritual core — what this world values or fears most]`,
        budgetNote: '≤3,000 chars',
      },
      {
        name: 'Rules & Effects',
        hint: 'The behavioral contract __HOST__ follows — scope, voice, persistence, and system prompting rules. Standard boilerplate is pre-filled; customize as needed.',
        syntax: `## 3) Rules & Effects
Scope: WRL changes only world/environment — not __HOST__'s identity.
Voice: All narration adapts to WRL tags (fantasy, sci-fi, horror, etc.).
Persistence: Once injected, WRL rules apply to all narration and NPCs until ejected.
Compatibility: Only one WRL active at a time unless explicitly layered.
System Prompting: Always apply [World Context: __WORLD_NAME__] at the start of narration.
No Breaks: WRL never references itself as "a file"; it feels like native world reality.`,
      },
      {
        name: 'Example Quotes / Lore Blocks',
        hint: 'Four set-labeled examples that guide __HOST__ in maintaining consistent world logic: a lore fragment, an NPC encounter, an effect tag overflow, and a world tone directive.',
        syntax: `**[Set: Lore Fragment]**
"[A lore passage — history, myth, or forbidden knowledge told in the world's voice]"

**[Set: NPC Encounter]**
**[NPC Name] ([role/type])**: "[Dialogue that embeds culture, law, or history naturally]"

**[Set: Effect Tag Overflow]**
Effect:[location tag], Effect:[atmosphere tag], Effect:[sensory tag]

**[Set: World Tone]**
[One-sentence narration direction for __HOST__ — e.g., "Narration heavy with cold betrayal, feudal codes, and the burden of oaths."]`,
      },
      {
        name: 'Chat Examples',
        hint: 'Four exchanges showing the world through: arrival atmosphere, an NPC encounter, faction dynamics in action, and a pure environmental moment.',
        syntax: `(Example 0 — Arrival / first impression of world)
[Narrator or NPC]: [Sensory-rich opening that establishes world atmosphere immediately]
__USER_NAME__: [First reaction]
[NPC]: [Response that deepens world-feel]

(Example 1 — NPC encounter in world)
[NPC with world-appropriate voice]: [Dialogue that embeds culture or history naturally]
__USER_NAME__: [Reaction]
[NPC]: [Follow-up revealing more of the world]

(Example 2 — Faction / conflict interaction)
[Shows power dynamics, tension, or allegiance — demonstrated, not explained]

(Example 3 — Atmospheric / environmental moment)
[Pure description — no plot, just world. The world breathing on its own.]`,
        budgetNote: '4 × ≤700 chars',
      },
    ],
    checklist: WRL_CHECKLIST,
    draftTemplate: WRL_DRAFT_TEMPLATE,
  },
}

export function getSchema(type: ContentType): TypeSchema {
  return TYPE_SCHEMAS[type]
}
