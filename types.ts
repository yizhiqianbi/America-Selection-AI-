
export enum GameScreen {
    MainMenu,
    CharacterCreation,
    TalentSelection,
    Gameplay,
    GameOver,
    Achievements // New Screen
}

export type Language = 'en' | 'zh';

export type LocalizedString = { en: string; zh: string };

export enum Party {
    Republican = 'Republican',
    Democrat = 'Democrat',
}

export enum Difficulty {
    Easy = 'Easy',
    Normal = 'Normal',
    Hard = 'Hard',
}

export interface CharacterStats {
    appealing: number;
    policySkill: number;
    organization: number;
    integrity: number;
}

export interface Talent {
    id: string;
    name: LocalizedString;
    description: LocalizedString;
}

export interface PlayerProfile {
    name:string;
    party: Party;
    slogan: string;
    biography: string;
    stats: CharacterStats;
    talents: Talent[];
    difficulty: Difficulty;
}

export interface OpponentProfile {
    name: string;
    party: Party;
    style: 'Aggressive' | 'Fundraiser' | 'Populist' | 'Methodical' | 'Trump';
    slogan: string;
}

export interface TurnEffects {
    pollsChange?: number;
    treasuryChange?: number;
    scandalChange?: number;
    opponentPollsChange?: number;
    opponentScandalChange?: number;
    opponentTreasuryChange?: number;
    electoralMapUpdates?: { state: string; affiliation: StateAffiliation }[];
    triggerOpponentScandal?: boolean;
    diceRollResult?: DiceRollResult;
    influenceChange?: number;
    mediaAttentionChange?: number;
    momentumChange?: number;
    // FIX: Added politicalCapitalChange to allow it as a valid turn effect.
    politicalCapitalChange?: number;
    // New effects for local activities
    addStateFocus?: { stateAbbr: string; buff: StateBuff };
    resolveProblemId?: string;
}


export interface StatModifier {
    stat: keyof CharacterStats;
    effect: keyof TurnEffects;
    multiplier: number;
    threshold: number; // The stat value above this threshold applies the bonus.
}


export interface GameEventChoice {
    text: LocalizedString;
    outcomeHint: LocalizedString;
    cost?: number;
    influenceCost?: number;
    baseEffects: TurnEffects;
    statModifiers?: StatModifier[];
    requiresDiceRoll?: {
        stat: keyof CharacterStats;
        difficulty: number;
        outcomes: { [key in RollOutcome]: TurnEffects };
    };
    addBuff?: GameBuff;
}


export interface GameEvent {
    id: string;
    title: LocalizedString;
    description: LocalizedString;
    choices: [GameEventChoice, GameEventChoice];
    isCritical?: boolean;
    scandalThreshold?: { above?: number, below?: number };
    isDebateQuestion?: boolean;
}

export enum StateAffiliation {
    Player = 'Player',
    Opponent = 'Opponent',
    Swing = 'Swing',
}

export type ElectoralMap = {
    [stateAbbreviation: string]: StateAffiliation;
};

export interface LocalProblemChoice {
    text: LocalizedString;
    outcomeHint: LocalizedString;
    buff: StateBuff; 
}

export interface StateBuff {
    name: LocalizedString;
    effect: TurnEffects; 
    turnsRemaining: number;
}

export interface LocalProblem {
    id: string;
    stateAbbr: string;
    title: LocalizedString;
    description: LocalizedString;
    choices: LocalProblemChoice[];
    resolved: boolean;
    rewardHint?: LocalizedString;
}

export interface GameBuff {
    id: string;
    name: LocalizedString;
    description: LocalizedString;
    turnsRemaining: number;
    effects: TurnEffects;
}

export interface NewsItem {
    id: string;
    type: 'news' | 'social-pro' | 'social-con' | 'pundit';
    source: string;
    text: string;
}

export interface GameState {
    // Core Stats
    polls: number;
    treasury: number;
    scandal: number; 
    progress: number;
    influence: number;
    mediaAttention: number;
    momentum: number;

    // Opponent Stats
    opponentPolls: number;
    opponentTreasury: number;
    opponentScandal: number;
    opponentProfile: OpponentProfile | null;
    
    // Game Data
    electoralMap: ElectoralMap;
    localProblems: LocalProblem[];
    currentEvent: GameEvent | null;
    stateFocus: { [stateAbbr: string]: StateBuff }; 
    activeBuffs: GameBuff[];
    newsFeed: NewsItem[];
}

export interface Achievement {
    id: string;
    icon: string;
    title: LocalizedString;
    description: LocalizedString;
    isHidden?: boolean; 
}

export type RollOutcome = 'Critical Success' | 'Success' | 'Failure' | 'Critical Failure';
export type DiceRollResult = { stat: keyof CharacterStats; outcome: RollOutcome };


export interface GeminiNarrativeResponse {
    newsItems: NewsItem[];
    imagePrompt?: string;
    unlockedAchievementId?: string;
}