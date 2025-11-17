export enum GameScreen {
    MainMenu,
    CharacterCreation,
    TalentSelection,
    Gameplay,
    GameOver,
}

export enum Party {
    Republican = '共和党',
    Democrat = '民主党',
}

export interface CharacterStats {
    appealing: number;
    policySkill: number;
    organization: number;
    integrity: number;
}

export interface Talent {
    name: string;
    description: string;
}

export interface PlayerProfile {
    name: string;
    party: Party;
    slogan: string;
    stats: CharacterStats;
    talents: Talent[];
}

export interface OpponentProfile {
    name: string;
    party: Party;
    style: string;
}

export interface GameEventChoice {
    text: string;
    outcomeHint: string;
}

export interface GameEvent {
    title: string;
    description: string;
    choices: GameEventChoice[];
}

export interface GameState {
    approval: number;
    funding: number;
    scandalRisk: number;
    progress: number; // 0-100, for the timeline
    opponentApproval: number;
    opponentFunding: number;
    opponentProfile: OpponentProfile | null;
}

export interface GeminiResponse {
    narrative?: string;
    opponentNarrative?: string;
    event?: GameEvent;
    gameStateUpdate?: {
        approval: number;
        funding: number;
        scandalRisk: number;
    };
    opponentStateUpdate?: {
        approval: number;
        funding: number;
    };
    opponentProfile?: OpponentProfile;
    imagePrompt?: string;
    isGameOver: boolean;
    gameOverReason: string;
}