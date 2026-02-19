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

export interface TypeSchema {
  type: ContentType
  label: string
  description: string
  charLimit: number
  secondaryLimits?: Record<string, number>
  questions: InterviewQuestion[]
  sections: string[]
  checklist: string[]
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
  'Background block within 6,850 chars',
  '4 chat examples present (Ex0=/stats, Ex1=single, Ex2=multi, Ex3=escalation)',
  'Each chat example under 700 chars',
  'Inner monologue format correct — 💭 emotion AND stat line both present',
  'Max 3 NPCs per reply rule stated',
  'Stats use correct scales (1–10 core, 0–100% relationship)',
  'Tag fields populated (Personality, Physical, Clothes, Location, Identity)',
  'Physical tag has no poses, no clothing, no character names',
  'Immersion rule stated exactly once',
  'Variables used consistently (__USER_NAME__, __PERSONA_NAME__)',
  'At least one mechanic beyond basic schema',
]

const SC_CHECKLIST = [
  'Total within 6,800 chars',
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
  'Total within 6,800 chars',
  '4 chat examples present (Ex0=shy, Ex1=dominant, Ex2=intellectual, Ex3=contrast)',
  'Each chat example under 700 chars',
  'Only ONE behavior change defined',
  'LoadLibrary: format correct',
  '__HOST__ used everywhere — no specific character names',
  'Activation method explicitly stated (exactly one)',
  'DLL never references itself as a "DLL" within behavior rules',
  'Awareness level defined',
]

const WRL_CHECKLIST = [
  'Total within 6,800 chars',
  'Intro block under 800 chars',
  'Lore Notes under 6,000 chars',
  '4 chat examples present (Ex0=arrival, Ex1=NPC, Ex2=faction, Ex3=atmosphere)',
  'Each chat example under 700 chars',
  'CORE block present (standard boilerplate)',
  'WRL never acknowledges itself as a file',
  'All 5 required sections present',
  'Variables: __HOST__ used, not specific character names',
]

// ────────────────────────────────────────────────────────────────────────────
// Export
// ────────────────────────────────────────────────────────────────────────────

export const TYPE_SCHEMAS: Record<ContentType, TypeSchema> = {
  RPG: {
    type: 'RPG',
    label: 'RPG Scenario',
    description: 'Multi-NPC game-master scenario with stats, factions, and inner monologue',
    charLimit: 6850,
    secondaryLimits: { chatExample: 700 },
    questions: RPG_QUESTIONS,
    sections: [
      'Opening Scenario',
      'Immersion Rule',
      'Map / Factions',
      'Stats Mechanics',
      'Inner Monologue System',
      'Dialog Format Rule',
      'Chat Example 0 (/stats)',
      'Chat Example 1 (Single NPC)',
      'Chat Example 2 (Multiple NPCs)',
      'Chat Example 3 (Escalation)',
    ],
    checklist: RPG_CHECKLIST,
  },
  SC: {
    type: 'SC',
    label: 'Single Character',
    description: 'One-on-one persona with deep psychological profile and relationship arc',
    charLimit: 6800,
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
    checklist: SC_CHECKLIST,
  },
  DLL: {
    type: 'DLL',
    label: 'DLL Modifier',
    description: 'Single-behavior modifier overlay that injects into any existing persona',
    charLimit: 6800,
    secondaryLimits: { chatExample: 700 },
    questions: DLL_QUESTIONS,
    sections: [
      'LoadLibrary Declaration',
      'Activation Method',
      'Behavior Rules',
      'Awareness Level',
      'Permanence',
      'Chat Example 0 (shy / reserved character)',
      'Chat Example 1 (dominant / assertive character)',
      'Chat Example 2 (intellectual / analytical character)',
      'Chat Example 3 (contrasting types — behavior consistency check)',
    ],
    checklist: DLL_CHECKLIST,
  },
  WRL: {
    type: 'WRL',
    label: 'World Overlay',
    description: 'Injectable world-environment overlay that defines setting and atmosphere',
    charLimit: 6800,
    secondaryLimits: { intro: 800, lore: 6000, chatExample: 700 },
    questions: WRL_QUESTIONS,
    sections: [
      'CORE Block',
      'World Intro (≤800 chars)',
      'World Structure',
      'Rules & Effects',
      'Example Quotes / Lore Blocks',
      'Traits',
      'Chat Example 0 (arrival / first impression of world)',
      'Chat Example 1 (NPC encounter in world)',
      'Chat Example 2 (faction / conflict interaction)',
      'Chat Example 3 (atmospheric / environmental moment)',
    ],
    checklist: WRL_CHECKLIST,
  },
}

export function getSchema(type: ContentType): TypeSchema {
  return TYPE_SCHEMAS[type]
}
