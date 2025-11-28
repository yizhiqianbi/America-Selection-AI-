import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PlayerProfile, GameState, GameEvent, GameEventChoice, Party, StateAffiliation, Language, OpponentProfile, CharacterStats, LocalProblem, LocalProblemChoice, TurnEffects, StateBuff, RollOutcome, DiceRollResult, GameBuff, Difficulty, NewsItem } from '../types';
import { getInitialOpponent, generateTurnNarrative, evaluateCustomAction } from '../services/geminiService';
import ElectionMap from './Map';
import LocalProblemModal from './LocalProblemModal';
import StateFocusModal from './StateFocusModal';
import StateEventModal from './StateEventModal';
import TurnSummaryModal from './TurnSummaryModal';
import SignaturePolicyModal from './SignaturePolicyModal';
import DiceRoll from './DiceRoll';
import { ELECTORAL_VOTES, UI_TEXT, SAFE_DEM_STATES, SAFE_REP_STATES, ACHIEVEMENTS_LIST, INITIAL_LOCAL_PROBLEMS, SWING_STATES, MASTER_EVENT_LIST, DIFFICULTY_MODIFIERS, STATE_FOCUS_OPTIONS, STATE_SPECIFIC_DECISIONS, STATE_ABBR_TO_NAME, CAMPAIGN_WEEKS, SCHEDULED_EVENTS, SIGNATURE_POLICIES, MEDIA_BIASES, SCANDAL_EVENTS, PARTY_SPECIFIC_EVENTS } from '../constants';
import { useMapSounds } from '../hooks/useAudio';
import { v4 as uuidv4 } from 'uuid';

type EnrichedGameState = GameState & { week: number; politicalCapital: number; };
type SignaturePolicy = typeof SIGNATURE_POLICIES[0];

interface TurnSummaryData {
    player: { polls: number; treasury: number; scandal: number; politicalCapital: number; };
    opponent: { polls: number; scandal: number; };
    flippedStates: { state: string; from: StateAffiliation; to: StateAffiliation; }[];
}

// --- Components ---

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const AchievementToast: React.FC<{ id: string; language: Language; onClose: () => void }> = ({ id, language, onClose }) => {
    const achievement = ACHIEVEMENTS_LIST.find(a => a.id === id);
    if (!achievement) return null;

    useEffect(() => {
        const timer = setTimeout(onClose, 4000); // Display for 4 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-pop-fade pointer-events-none">
            <div className="bg-slate-900/95 border-2 border-amber-500/80 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.4)] p-5 flex items-center gap-5 backdrop-blur-md min-w-[320px]">
                <div className="text-5xl animate-bounce filter drop-shadow-lg">{achievement.icon}</div>
                <div>
                    <div className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Achievement Unlocked</div>
                    <div className="font-bold text-white text-lg text-shadow-md">{achievement.title[language]}</div>
                    <div className="text-xs text-gray-300 mt-1">{achievement.description[language]}</div>
                </div>
            </div>
        </div>
    );
};

const WeekCounter: React.FC<{ week: number; language: Language }> = ({ week, language }) => {
    const t = UI_TEXT[language];
    return (
        <div className="absolute top-4 right-4 z-10 p-3 rounded-xl glass-panel animate-fadeIn pointer-events-none select-none text-center">
             <div className="text-sm font-bold text-gray-300 uppercase tracking-widest">{t.week} {week} {t.of} {CAMPAIGN_WEEKS}</div>
        </div>
    );
};


const NewsFeed: React.FC<{ newsFeed: NewsItem[], isNarrativeLoading: boolean, t: any }> = ({ newsFeed, isNarrativeLoading, t }) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = 0;
        }
    }, [newsFeed]);

    const ICONS: { [key: string]: string } = {
        'news': '📰', 'social-pro': '📣 ', 'social-con': '💥', 'pundit': '👔', 'entertainment': '🎬', 'finance': '📉', 'international': '🌍'
    };

    return (
         <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none">
            {isNarrativeLoading && (
                <div className="absolute bottom-4 left-4 text-xs text-gray-400 animate-pulse">{t.generatingNews}</div>
            )}
            <div ref={feedRef} className="h-full w-full overflow-y-auto custom-scrollbar p-4 flex flex-col-reverse gap-2 mask-image-bottom">
                {newsFeed.map(item => (
                    <div key={item.id} className="w-full animate-fadeIn text-shadow-lg text-lg">
                        <span className="font-bold text-cyan-300 mr-2">{ICONS[item.type] || '⚫'} {item.source}:</span>
                        <span className="text-gray-200">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatBar: React.FC<{ value: number; colorClass: string; }> = ({ value, colorClass }) => (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${value}%`}}></div>
    </div>
);

const HeadToHeadDisplay: React.FC<{ player: PlayerProfile; opponent: OpponentProfile; gameState: EnrichedGameState; t: any; onOpenPolicyModal: () => void; }> = ({ player, opponent, gameState, t, onOpenPolicyModal }) => {
    return (
        <div className="p-4 border-b border-white/10">
            <div className="grid grid-cols-2 gap-4">
                {/* Player Side */}
                <div className="text-left">
                    <p className="text-lg font-black text-blue-400 truncate">{player.name}</p>
                    <div className="space-y-1 mt-2">
                         <div>
                            <div className="text-xs font-bold text-gray-400 flex justify-between"><span>{t.polls}</span><span>{gameState.polls.toFixed(1)}%</span></div>
                            <StatBar value={gameState.polls} colorClass="bg-green-500" />
                        </div>
                         <div>
                            <div className="text-xs font-bold text-gray-400 flex justify-between"><span>{t.treasury}</span><span>${gameState.treasury}M</span></div>
                            <StatBar value={Math.min(100, gameState.treasury / 2)} colorClass="bg-sky-500" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 flex justify-between"><span>{t.influence}</span><span>{gameState.influence}</span></div>
                            <StatBar value={gameState.influence} colorClass="bg-purple-500" />
                        </div>
                         <div>
                            <div className="text-xs font-bold text-gray-400 flex justify-between"><span>{t.scandal}</span><span>{gameState.scandal.toFixed(1)}%</span></div>
                            <StatBar value={gameState.scandal} colorClass="bg-red-500" />
                        </div>
                    </div>
                </div>
                {/* Opponent Side */}
                 <div className="text-right">
                    <p className="text-lg font-black text-red-400 truncate">{opponent.name}</p>
                     <div className="space-y-1 mt-2">
                        <div>
                            <div className="text-xs font-bold text-gray-400 flex justify-between"><span>{gameState.opponentPolls.toFixed(1)}%</span><span>{t.polls}</span></div>
                            <StatBar value={gameState.opponentPolls} colorClass="bg-green-500" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 flex justify-between"><span>${gameState.opponentTreasury}M</span><span>{t.treasury}</span></div>
                            <StatBar value={Math.min(100, gameState.opponentTreasury / 2)} colorClass="bg-sky-500" />
                        </div>
                         <div>
                            <div className="text-xs font-bold text-gray-400 flex justify-between"><span>{gameState.opponentScandal.toFixed(1)}%</span><span>{t.scandal}</span></div>
                            <StatBar value={gameState.opponentScandal} colorClass="bg-red-500" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Political Capital & Signature Policies */}
            <div className="mt-3 flex justify-center items-center gap-4">
                 <div className="text-center">
                    <div className="text-xs font-bold text-gray-400">{t.politicalCapital}</div>
                    <div className="text-2xl font-black text-amber-400 font-mono">⭐ {gameState.politicalCapital}</div>
                </div>
                <button
                    onClick={onOpenPolicyModal}
                    className="px-4 py-2 text-xs font-bold text-purple-300 bg-purple-900/50 border border-purple-700 rounded-lg hover:bg-purple-800/70 transition-colors"
                >
                    {t.signaturePolicies}
                </button>
            </div>
        </div>
    );
};


const MomentumBar: React.FC<{ value: number; t: any }> = ({ value, t }) => {
    const momentumColor = useMemo(() => {
        if (value > 75) return 'from-amber-400 to-yellow-500';
        if (value > 50) return 'from-sky-400 to-cyan-500';
        return 'from-slate-500 to-gray-600';
    }, [value]);
    return (
        <div className="p-3 border-b border-white/10">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex justify-between items-center mb-1">
                <span>{t.momentum}</span>
                <span className="font-mono">{value}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${momentumColor} transition-all duration-500`} style={{ width: `${value}%`}}></div>
            </div>
        </div>
    );
};

// --- Main Component ---

interface GamePlayProps {
    playerProfile: PlayerProfile;
    onGameOver: (reason: string) => void;
    language: Language;
    onUnlockAchievement: (id: string) => void;
}

const GamePlay: React.FC<GamePlayProps> = ({ playerProfile, onGameOver, language, onUnlockAchievement }) => {
    const t = UI_TEXT[language];
    const { playClick, playAlert, playFlip } = useMapSounds();
    const difficultyModifiers = DIFFICULTY_MODIFIERS[playerProfile.difficulty];

    const [gameState, setGameState] = useState<EnrichedGameState | null>(null);
    const [isNarrativeLoading, setIsNarrativeLoading] = useState(true);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);

    const [activeToast, setActiveToast] = useState<string | null>(null);
    
    const [focusStateAbbr, setFocusStateAbbr] = useState<string | null>(null);
    const [activeProblem, setActiveProblem] = useState<LocalProblem | null>(null);
    const [diceRoll, setDiceRoll] = useState<{ choice: GameEventChoice; roll: NonNullable<GameEventChoice['requiresDiceRoll']> } | null>(null);
    const [turnSummaryData, setTurnSummaryData] = useState<TurnSummaryData | null>(null);
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [usedPolicyIds, setUsedPolicyIds] = useState<string[]>([]);
    
    const [stateDecision, setStateDecision] = useState<GameEvent | null>(null);
    const [targetStateForDecision, setTargetStateForDecision] = useState<string | null>(null);
    const [isStateEventModalOpen, setIsStateEventModalOpen] = useState(false);
    
    // Custom Action State
    const [customActionText, setCustomActionText] = useState('');
    const [isAnalyzingAction, setIsAnalyzingAction] = useState(false);

    // Zoom control
    const [resetMapZoom, setResetMapZoom] = useState(0);

    const opponentParty = useMemo(() => playerProfile.party === Party.Democrat ? Party.Republican : Party.Democrat, [playerProfile.party]);
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const applyTurnEffects = useCallback((effects: TurnEffects, currentState: EnrichedGameState): EnrichedGameState => {
        const newState = { ...currentState };
        const mediaMultiplier = 1 + (currentState.mediaAttention / 100);

        if(newState.momentum > 75) {
             effects.pollsChange = (effects.pollsChange ?? 0) + 1;
        }

        newState.polls = clamp(newState.polls + (effects.pollsChange ?? 0), 0, 100);
        newState.treasury += effects.treasuryChange ?? 0;
        newState.scandal = clamp(newState.scandal + ((effects.scandalChange ?? 0) * mediaMultiplier), 0, 100);
        newState.influence = clamp(newState.influence + (effects.influenceChange ?? 0), 0, 100);
        newState.mediaAttention = clamp(newState.mediaAttention + (effects.mediaAttentionChange ?? 0), 0, 100);
        newState.momentum = clamp(newState.momentum + (effects.momentumChange ?? 0), 0, 100);
        newState.politicalCapital = clamp(newState.politicalCapital + ((effects as any).politicalCapitalChange ?? 0), 0, 100);

        newState.opponentPolls = clamp(newState.opponentPolls + (effects.opponentPollsChange ?? 0), 0, 100);
        newState.opponentScandal = clamp(newState.opponentScandal + (effects.opponentScandalChange ?? 0), 0, 100);
        newState.opponentTreasury += effects.opponentTreasuryChange ?? 0;

        if (effects.triggerOpponentScandal) {
            newState.opponentScandal = clamp(newState.opponentScandal + (20 * mediaMultiplier), 0, 100);
            newState.opponentPolls = clamp(newState.opponentPolls - 5, 0, 100);
        }

        if (effects.electoralMapUpdates) {
            const newMap = { ...newState.electoralMap };
            effects.electoralMapUpdates.forEach(update => {
                newMap[update.state] = update.affiliation;
            });
            newState.electoralMap = newMap;
        }
        
        if (effects.addStateFocus) {
            newState.stateFocus = { 
                ...newState.stateFocus, 
                [effects.addStateFocus.stateAbbr]: effects.addStateFocus.buff 
            };
        }

        if (effects.resolveProblemId) {
            newState.localProblems = newState.localProblems.map(p => 
                p.id === effects.resolveProblemId ? { ...p, resolved: true } : p
            );
        }
        
        return newState;
    }, []);
    
    // Refined Event Selection Logic
    const getNewNationalEvent = useCallback((previousEventId: string | null, currentScandal: number, profile: PlayerProfile): GameEvent => {
        // 1. High Scandal Probability Check
        if (currentScandal > 60 && Math.random() < 0.4) {
            // Find a scandal event not recently played
            const availableScandalEvents = SCANDAL_EVENTS.filter(e => e.id !== previousEventId);
            if (availableScandalEvents.length > 0) {
                return availableScandalEvents[Math.floor(Math.random() * availableScandalEvents.length)];
            }
        }

        // 2. Party Specific Events (20% chance)
        if (Math.random() < 0.2) {
            const partyEvents = PARTY_SPECIFIC_EVENTS[profile.party];
            if (partyEvents && partyEvents.length > 0) {
                const event = partyEvents.find(e => e.id !== previousEventId);
                if (event) return event;
            }
        }

        // 3. Fallback to Master List
        const potentialEvents = MASTER_EVENT_LIST.filter(event => event.id !== previousEventId);
        if (potentialEvents.length === 0) {
            return MASTER_EVENT_LIST[Math.floor(Math.random() * MASTER_EVENT_LIST.length)];
        }
        return potentialEvents[Math.floor(Math.random() * potentialEvents.length)];
    }, []);
    
    const getNewStateEvent = useCallback((): [GameEvent | null, string | null] => {
        const swingStateEvents = STATE_SPECIFIC_DECISIONS.filter(e => SWING_STATES.includes(e.stateAbbr));
        const safeStateEvents = STATE_SPECIFIC_DECISIONS.filter(e => !SWING_STATES.includes(e.stateAbbr));
        const pickFromSwing = (Math.random() < 0.9 && swingStateEvents.length > 0) || safeStateEvents.length === 0;
        let chosenEvent: (GameEvent & { stateAbbr: string }) | undefined;
        if (pickFromSwing && swingStateEvents.length > 0) {
            chosenEvent = swingStateEvents[Math.floor(Math.random() * swingStateEvents.length)];
        } else if (safeStateEvents.length > 0) {
            chosenEvent = safeStateEvents[Math.floor(Math.random() * safeStateEvents.length)];
        }
        return chosenEvent ? [chosenEvent, chosenEvent.stateAbbr] : [null, null];
    }, []);

    const createInitialGameState = useCallback((profile: PlayerProfile, opp: OpponentProfile, initialNews: NewsItem[]): EnrichedGameState => {
        const modifiers = DIFFICULTY_MODIFIERS[profile.difficulty];
        const initialMap: GameState['electoralMap'] = {};
        Object.keys(ELECTORAL_VOTES).forEach(abbr => {
            if (SAFE_DEM_STATES.includes(abbr)) initialMap[abbr] = profile.party === Party.Democrat ? StateAffiliation.Player : StateAffiliation.Opponent;
            else if (SAFE_REP_STATES.includes(abbr)) initialMap[abbr] = profile.party === Party.Republican ? StateAffiliation.Player : StateAffiliation.Opponent;
            else initialMap[abbr] = StateAffiliation.Swing;
        });

        return {
            polls: 50, treasury: modifiers.initialTreasury, scandal: 10, progress: 0, 
            influence: modifiers.initialInfluence, mediaAttention: 20, momentum: 50,
            opponentPolls: 50, opponentTreasury: 50, opponentScandal: 10,
            opponentProfile: opp, electoralMap: initialMap, localProblems: INITIAL_LOCAL_PROBLEMS,
            currentEvent: null, stateFocus: {}, activeBuffs: [], newsFeed: initialNews,
            week: 1, politicalCapital: modifiers.initialPoliticalCapital,
        };
    }, []);

    const runOpponentTurn = useCallback((currentGameState: EnrichedGameState, playerProfile: PlayerProfile): { playerEffects: TurnEffects, opponentStateChanges: Partial<EnrichedGameState>, actionName: string, success: boolean } => {
        if (!currentGameState.opponentProfile) return { playerEffects: {}, opponentStateChanges: {}, actionName: "Planning", success: false };
    
        const { opponentTreasury, polls, opponentPolls, scandal, momentum } = currentGameState;
        const { integrity } = playerProfile.stats;
        const aiAggressiveness = difficultyModifiers.aiAggressiveness;
    
        const actions: { name: string; score: number; cost?: number }[] = [];
    
        // Define potential actions and score them based on game state
        // Action: Exploit Player Scandal
        if (opponentTreasury > 15) {
            const score = Math.max(0, (scandal - 30) / 5 * aiAggressiveness);
            if (score > 0) actions.push({ name: 'exploitScandal', score, cost: 15 });
        }
    
        // Action: Smear Campaign (attacks low integrity)
        if (opponentTreasury > 25) {
            const score = Math.max(0, (5 - integrity) * 2 * aiAggressiveness);
             if (score > 0) actions.push({ name: 'smearCampaign', score, cost: 25 });
        }
    
        // Action: Negative Ads (if losing or player has high momentum)
        if (opponentTreasury > 20) {
            const score = Math.max(0, ((polls - opponentPolls) / 4 + momentum / 15) * aiAggressiveness);
            if (score > 0) actions.push({ name: 'negativeAds', score, cost: 20 });
        }
    
        // Action: Rally in Swing State
        const rallyScore = 1 + (momentum / 40) + ((polls - opponentPolls) / 20); // Base action, better if player momentum is high or opponent is losing
        actions.push({ name: 'rally', score: Math.max(0, rallyScore) });
    
        // Action: Fundraising
        const fundraisingScore = 2 + Math.max(0, 80 - opponentTreasury) / 10; // Becomes very important when treasury is low
        actions.push({ name: 'fundraising', score: fundraisingScore });
    
        // Filter out unaffordable actions, sort by score, and pick the best one
        const possibleActions = actions
            .filter(a => opponentTreasury >= (a.cost ?? 0))
            .sort((a, b) => b.score - a.score);
    
        const chosenActionName = possibleActions.length > 0 ? possibleActions[0].name : 'fundraising';
        
        let actionName = "Fundraising Drive";
        let playerEffects: TurnEffects = {};
        const opponentStateChanges: Partial<EnrichedGameState> = {};

        switch (chosenActionName) {
            case 'exploitScandal':
                actionName = "Amplify Scandal";
                playerEffects.scandalChange = 5;
                playerEffects.pollsChange = -3;
                opponentStateChanges.opponentTreasury = opponentTreasury - 15;
                break;
            case 'smearCampaign':
                actionName = "Launch Smear Campaign";
                playerEffects.scandalChange = 8;
                playerEffects.pollsChange = -2;
                opponentStateChanges.opponentTreasury = opponentTreasury - 25;
                break;
            case 'negativeAds':
                actionName = "Negative Ad Campaign";
                playerEffects.pollsChange = -4;
                playerEffects.scandalChange = 1;
                playerEffects.momentumChange = -5;
                opponentStateChanges.opponentTreasury = opponentTreasury - 20;
                break;
            case 'rally':
                const swingState = SWING_STATES[Math.floor(Math.random() * SWING_STATES.length)];
                actionName = `Rally in ${swingState}`;
                opponentStateChanges.opponentPolls = clamp(opponentPolls + 2, 0, 100);
                const newMap = { ...currentGameState.electoralMap };
                if (Math.random() < 0.2) {
                    newMap[swingState] = StateAffiliation.Opponent;
                    opponentStateChanges.electoralMap = newMap;
                }
                break;
            case 'fundraising':
            default:
                actionName = "Standard Fundraising";
                opponentStateChanges.opponentTreasury = opponentTreasury + Math.round(20 / difficultyModifiers.fundraisingModifier);
                break;
        }

        return { playerEffects, opponentStateChanges, actionName, success: true };
    }, [difficultyModifiers]);


    const prepareNextTurn = useCallback((currentState: EnrichedGameState): EnrichedGameState => {
        let nextState = { ...currentState };
        
        if (nextState.week > CAMPAIGN_WEEKS) {
            const playerScore = Object.entries(nextState.electoralMap).reduce((acc, [abbr, aff]) => acc + (aff === StateAffiliation.Player ? ELECTORAL_VOTES[abbr] : 0), 0);
            setTimeout(() => onGameOver(playerScore >= 270 ? `You have won the election with ${playerScore} electoral votes!` : `You have lost the election with only ${playerScore} electoral votes.`), 500);
            return nextState;
        }
    
        const scheduled = SCHEDULED_EVENTS.find(e => e.week === nextState.week);
        if (scheduled) {
            nextState.currentEvent = { ...scheduled.event };
            setStateDecision(null);
            setTargetStateForDecision(null);
        } else {
            // UPDATED logic to pass scandal and profile for dynamic events
            nextState.currentEvent = getNewNationalEvent(currentState.currentEvent?.id || null, currentState.scandal, playerProfile);
            const [newStateEvent, targetState] = getNewStateEvent();
            setStateDecision(newStateEvent);
            setTargetStateForDecision(targetState);
        }
        return nextState;
    }, [getNewNationalEvent, getNewStateEvent, onGameOver, playerProfile]);

    const executeTurn = useCallback(async (choice: GameEventChoice, effects: TurnEffects) => {
        if (!gameState) return;

        const turnStartState = { ...gameState };
        setGameState(current => current ? { ...current, currentEvent: null } : null);
        setStateDecision(null); setTargetStateForDecision(null); setIsNarrativeLoading(true);

        let midTurnState = applyTurnEffects(effects, turnStartState);
        if (choice.addBuff) midTurnState.activeBuffs = [...midTurnState.activeBuffs, choice.addBuff];

        const { playerEffects: opponentPlayerEffects, opponentStateChanges, actionName: oppActionName, success: oppSuccess } = runOpponentTurn(midTurnState, playerProfile);
        const narrative = await generateTurnNarrative(turnStartState.newsFeed, language, choice.text[language], effects, oppActionName, oppSuccess);
        
        let turnEndState = applyTurnEffects(opponentPlayerEffects, midTurnState);
        turnEndState = { ...turnEndState, ...opponentStateChanges };
        turnEndState.newsFeed = [...narrative.newsItems, ...turnStartState.newsFeed].slice(0, 20);

        // Media Bias Logic
        let pollChangeFromMedia = 0;
        narrative.newsItems.forEach(item => {
            const bias = MEDIA_BIASES[item.source as keyof typeof MEDIA_BIASES];
            if (bias) {
                if (bias === playerProfile.party) {
                    pollChangeFromMedia += 0.5; // Small boost from friendly media
                } else {
                    pollChangeFromMedia -= 0.5; // Small hit from hostile media
                }
            }
        });

        if (pollChangeFromMedia !== 0) {
            turnEndState.polls = clamp(turnEndState.polls + pollChangeFromMedia, 0, 100);
            turnEndState.opponentPolls = clamp(turnEndState.opponentPolls - pollChangeFromMedia, 0, 100);
        }

        const nextBuffs: GameBuff[] = [];
        turnEndState.activeBuffs.forEach(buff => { if (buff.turnsRemaining > 1) nextBuffs.push({ ...buff, turnsRemaining: buff.turnsRemaining - 1 }); });
        turnEndState.activeBuffs = nextBuffs;
        
        const nextStateFocus: { [stateAbbr: string]: StateBuff } = {};
        let stateBuffEffects: TurnEffects = {};
        const mapUpdatesFromBuffs: { state: string; affiliation: StateAffiliation }[] = [];

        Object.keys(turnEndState.stateFocus).forEach((abbr) => {
            const buff = turnEndState.stateFocus[abbr];
            Object.keys(buff.effect).forEach(key => {
                const typedKey = key as keyof TurnEffects;
                // Skip pollsChange as it is handled specifically for state flips below
                if (typedKey === 'pollsChange') return;
                
                const value = buff.effect[typedKey];
                
                if (typeof value === 'number') {
                    // Accumulate numeric effects
                    (stateBuffEffects as any)[typedKey] = ((stateBuffEffects as any)[typedKey] ?? 0) + value;
                } else if (typedKey === 'electoralMapUpdates' && Array.isArray(value)) {
                    // Accumulate map updates by concatenating arrays
                    stateBuffEffects.electoralMapUpdates = [
                        ...(stateBuffEffects.electoralMapUpdates || []),
                        ...value
                    ];
                }
            });

            if (buff.effect.pollsChange && buff.effect.pollsChange > 0) {
                const currentAff = turnEndState.electoralMap[abbr]; const roll = Math.random() * 100;
                if (currentAff === StateAffiliation.Swing && roll < buff.effect.pollsChange) mapUpdatesFromBuffs.push({ state: abbr, affiliation: StateAffiliation.Player });
                else if (currentAff === StateAffiliation.Opponent && roll < buff.effect.pollsChange / 2) mapUpdatesFromBuffs.push({ state: abbr, affiliation: StateAffiliation.Swing });
            }
            if (buff.turnsRemaining > 1) nextStateFocus[abbr] = { ...buff, turnsRemaining: buff.turnsRemaining - 1 };
        });
        turnEndState.stateFocus = nextStateFocus;
        turnEndState = applyTurnEffects(stateBuffEffects, turnEndState);
        if (mapUpdatesFromBuffs.length > 0) {
            const newMap = { ...turnEndState.electoralMap };
            mapUpdatesFromBuffs.forEach(update => newMap[update.state] = update.affiliation);
            turnEndState.electoralMap = newMap;
        }
        
        turnEndState.week = turnStartState.week + 1;
        setGameState(turnEndState);

        const summary: TurnSummaryData = {
            player: {
                polls: turnEndState.polls - turnStartState.polls, treasury: turnEndState.treasury - turnStartState.treasury,
                scandal: turnEndState.scandal - turnStartState.scandal, politicalCapital: turnEndState.politicalCapital - turnStartState.politicalCapital,
            },
            opponent: { polls: turnEndState.opponentPolls - turnStartState.opponentPolls, scandal: turnEndState.opponentScandal - turnStartState.opponentScandal },
            flippedStates: Object.keys(turnStartState.electoralMap).filter(abbr => turnStartState.electoralMap[abbr] !== turnEndState.electoralMap[abbr]).map(abbr => ({
                state: abbr, from: turnStartState.electoralMap[abbr], to: turnEndState.electoralMap[abbr]
            })),
        };
        if (narrative.unlockedAchievementId) { 
            onUnlockAchievement(narrative.unlockedAchievementId); 
            setActiveToast(narrative.unlockedAchievementId);
            playFlip();
        }
        setIsNarrativeLoading(false); setTurnSummaryData(summary);
    }, [gameState, language, onUnlockAchievement, difficultyModifiers, applyTurnEffects, runOpponentTurn, generateTurnNarrative, playerProfile, playFlip]);

    useEffect(() => {
        const initializeGame = async () => {
            setIsNarrativeLoading(true);
            const { opponentProfile, newsFeed } = await getInitialOpponent(playerProfile, language);
            if (opponentProfile) {
                let initialState = createInitialGameState(playerProfile, opponentProfile, newsFeed);
                initialState = prepareNextTurn(initialState);
                setGameState(initialState);
                setIsPlayerTurn(true);
            }
            setIsNarrativeLoading(false);
        };
        initializeGame();
    }, [playerProfile, language, createInitialGameState, prepareNextTurn]);

    const handleContinueFromSummary = () => {
        setTurnSummaryData(null);
        if (gameState) {
            const nextState = prepareNextTurn(gameState);
            setGameState(nextState);
            if(nextState.week <= CAMPAIGN_WEEKS) setIsPlayerTurn(true);
        }
    };

    const handleStateSelect = useCallback((abbr: string) => {
        if (!gameState) return;

        // Priority 1: Active State Dispatch (Transient Event)
        if (targetStateForDecision === abbr && stateDecision) {
            setIsStateEventModalOpen(true);
            playClick();
            return;
        }

        // Priority 2: Existing Local Problem (Persistent)
        const problem = gameState.localProblems.find(p => p.stateAbbr === abbr && !p.resolved);
        if (problem) { setActiveProblem(problem); playClick(); return; } 
        
        // Priority 3: State Focus (Empty slot)
        if (!gameState.stateFocus[abbr]) { setFocusStateAbbr(abbr); playClick(); return; } 
        
        playAlert();
    }, [gameState, playClick, playAlert, targetStateForDecision, stateDecision]);

    const handleSelectStateFocus = (option: typeof STATE_FOCUS_OPTIONS[0]) => {
        if (!gameState || !focusStateAbbr) return;
        playClick();
        
        // Check affordability
        const newTreasury = gameState.treasury - (option.cost.treasury ?? 0);
        const newInfluence = gameState.influence - (option.cost.influence ?? 0);
        if (newTreasury < 0 || newInfluence < 0) { 
            setFocusStateAbbr(null); 
            playAlert();
            return; 
        }

        setIsPlayerTurn(false);

        // Construct a synthetic choice for the turn execution
        const stateName = STATE_ABBR_TO_NAME[focusStateAbbr] || focusStateAbbr;
        const choice: GameEventChoice = {
            text: { 
                en: `Focus on ${stateName}: ${option.name.en}`, 
                zh: `关注 ${stateName}: ${option.name.zh}` 
            },
            outcomeHint: option.description,
            cost: option.cost.treasury,
            influenceCost: option.cost.influence,
            baseEffects: {
                treasuryChange: -(option.cost.treasury || 0),
                influenceChange: -(option.cost.influence || 0),
                addStateFocus: { 
                    stateAbbr: focusStateAbbr, 
                    buff: { name: option.name, effect: option.effect, turnsRemaining: option.duration } 
                }
            }
        };

        executeTurn(choice, choice.baseEffects);
        setFocusStateAbbr(null);
        setResetMapZoom(prev => prev + 1); // Trigger zoom out
    };
    
    const handleLocalProblemChoice = (choice: LocalProblemChoice) => {
        if (!activeProblem) return;
        playClick();
        setIsPlayerTurn(false);

        // Map LocalProblemChoice to GameEventChoice
        const gameEventChoice: GameEventChoice = {
            text: choice.text,
            outcomeHint: choice.outcomeHint,
            baseEffects: {
                resolveProblemId: activeProblem.id,
                // Apply the buff as a state focus
                addStateFocus: { 
                    stateAbbr: activeProblem.stateAbbr, 
                    buff: choice.buff 
                }
            }
        };
        executeTurn(gameEventChoice, gameEventChoice.baseEffects);
        setActiveProblem(null);
        setResetMapZoom(prev => prev + 1); // Trigger zoom out
    };

    const handleChoice = (choice: GameEventChoice) => {
        if (!gameState || !isPlayerTurn) return;
        if (gameState.treasury < (choice.cost ?? 0) || gameState.influence < (choice.influenceCost ?? 0) || gameState.politicalCapital < ((choice as any).politicalCapitalCost ?? 0)) { playAlert(); return; }
        setIsPlayerTurn(false); playClick();
        setResetMapZoom(prev => prev + 1); // Ensure map zoom resets after choice
        if (choice.requiresDiceRoll) setDiceRoll({ choice, roll: choice.requiresDiceRoll });
        else executeTurn(choice, (choice.baseEffects || {}));
    };

    // --- NEW: Custom Action Handler ---
    const handleCustomAction = async () => {
        if (!gameState || !isPlayerTurn || !customActionText.trim() || !gameState.currentEvent) return;
        
        setIsAnalyzingAction(true);
        playClick();

        const result = await evaluateCustomAction(
            gameState.currentEvent,
            customActionText,
            playerProfile,
            language
        );

        setIsAnalyzingAction(false);
        setCustomActionText('');
        setResetMapZoom(prev => prev + 1);

        // Map the result to a synthetic GameEventChoice to reuse execution logic
        const syntheticChoice: GameEventChoice = {
            text: { en: customActionText, zh: customActionText },
            outcomeHint: { en: "Custom Strategy", zh: "自定义策略" },
            baseEffects: result.effects
        };

        // We override the default narrative logic slightly by passing the action description
        // But for now, we'll let executeTurn regenerate the narrative using the effects.
        // To do this perfectly, we might want to pass the specific 'actionDescription' 
        // to generateTurnNarrative, but executeTurn uses choice.text[language] as the action text.
        // So we set the choice text to the description returned by the AI?
        // Actually, let's keep the user's input as the 'Action Text', but the AI's effects will dictate the narrative.
        
        executeTurn(syntheticChoice, result.effects);
    };
    
    const handleDiceRollComplete = (outcome: RollOutcome) => {
        if (!diceRoll) return;
        const effectsFromRoll = diceRoll.roll.outcomes[outcome];
        const combinedEffects = { ...(diceRoll.choice.baseEffects || {}), ...effectsFromRoll };
        combinedEffects.diceRollResult = { stat: diceRoll.roll.stat, outcome };
        const choice = diceRoll.choice; setDiceRoll(null);
        executeTurn(choice, combinedEffects);
    };

    const handleEnactPolicy = (policy: SignaturePolicy) => {
        if (!gameState) return;
        const cost = policy.cost;
        if (gameState.politicalCapital < (cost.politicalCapital ?? 0) || gameState.treasury < (cost.treasury ?? 0) || gameState.influence < (cost.influence ?? 0)) { playAlert(); return; }
        playClick(); setIsPolicyModalOpen(false); setUsedPolicyIds(prev => [...prev, policy.id]);
        setGameState(prev => {
            if (!prev) return null;
            let newState = { ...prev };
            newState.politicalCapital -= cost.politicalCapital ?? 0;
            newState.treasury -= cost.treasury ?? 0;
            newState.influence -= cost.influence ?? 0;
            newState = applyTurnEffects(policy.effects as TurnEffects, newState);
            return newState;
        });
    };
    
    const handleCloseLocalProblem = () => {
        setActiveProblem(null);
        setResetMapZoom(prev => prev + 1);
    }
    
    const handleCloseStateFocus = () => {
        setFocusStateAbbr(null);
        setResetMapZoom(prev => prev + 1);
    }

    const handleCloseStateEventModal = () => {
        setIsStateEventModalOpen(false);
        setResetMapZoom(prev => prev + 1);
    }

    if (!gameState || !gameState.opponentProfile) return <div className="flex items-center justify-center h-screen w-full text-2xl animate-pulse">{t.initializing}</div>;

    const { currentEvent } = gameState;

    return (
        <div className="w-screen h-screen flex bg-black">
            {activeToast && <AchievementToast id={activeToast} language={language} onClose={() => setActiveToast(null)} />}
            
            <div className="w-2/3 h-full flex flex-col relative">
                <ElectionMap 
                    mapData={gameState.electoralMap} 
                    playerParty={playerProfile.party} 
                    opponentParty={opponentParty} 
                    localProblems={gameState.localProblems} 
                    stateFocus={gameState.stateFocus} 
                    onStateSelect={handleStateSelect} 
                    language={language}
                    forceZoomOut={resetMapZoom}
                    activeEventStateAbbr={targetStateForDecision}
                />
                <NewsFeed newsFeed={gameState.newsFeed} isNarrativeLoading={isNarrativeLoading} t={t} />
                <WeekCounter week={gameState.week} language={language} />
            </div>

            <div className="w-1/3 h-full bg-slate-900 border-l-2 border-slate-700 flex flex-col overflow-y-auto custom-scrollbar">
                <HeadToHeadDisplay player={playerProfile} opponent={gameState.opponentProfile} gameState={gameState} t={t} onOpenPolicyModal={() => setIsPolicyModalOpen(true)} />
                <MomentumBar value={gameState.momentum} t={t} />
                
                <div className="p-6 flex-grow flex flex-col gap-6">
                    {isPlayerTurn && currentEvent && (
                        <div className="flex flex-col animate-fadeIn">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                                {t.nationalAgendaTitle}
                                {SCANDAL_EVENTS.some(e => e.id === currentEvent.id) && (
                                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] animate-pulse">{t.breakingScandal}</span>
                                )}
                            </h2>
                            <div className={`flex-grow p-4 rounded-xl relative transition-all duration-300 ${
                                currentEvent.isDebateQuestion 
                                    ? 'bg-gradient-to-br from-indigo-900/80 to-slate-900 border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]' 
                                    : SCANDAL_EVENTS.some(e => e.id === currentEvent.id)
                                        ? 'bg-slate-900 border-2 border-red-500 animate-pulse-border'
                                        : 'bg-slate-800/50 border border-slate-700/50'
                            }`}>
                                {currentEvent.isDebateQuestion && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest px-4 py-1 rounded-full">{t.debateNight}</div>}
                                <h3 className={`text-xl font-black mb-2 ${
                                    currentEvent.isDebateQuestion 
                                        ? 'text-indigo-200' 
                                        : SCANDAL_EVENTS.some(e => e.id === currentEvent.id)
                                            ? 'text-red-400'
                                            : 'text-white'
                                }`}>{currentEvent.title[language]}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{currentEvent.description[language]}</p>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-2">
                                {currentEvent.choices.map((choice, idx) => {
                                    const canAfford = gameState.treasury >= (choice.cost ?? 0) && gameState.influence >= (choice.influenceCost ?? 0);
                                    const costString = [choice.cost && `$${choice.cost}M`, choice.influenceCost && `${choice.influenceCost} ${t.influence}`].filter(Boolean).join(' / ');
                                    return <button key={idx} onClick={() => handleChoice(choice)} disabled={!isPlayerTurn || !canAfford} className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-left transition-all group enabled:hover:bg-blue-900/50 enabled:hover:border-blue-500 disabled:opacity-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-grow"><p className="font-bold text-sm text-gray-200 group-enabled:group-hover:text-white">{choice.text[language]}</p><p className="text-xs text-gray-500 mt-1 italic group-enabled:group-hover:text-blue-300">{choice.outcomeHint[language]}</p></div>
                                            {costString && <div className={`ml-4 text-right text-xs font-bold flex-shrink-0 ${canAfford ? 'text-gray-400' : 'text-red-500'}`}>{costString.split(' / ').map(s => <div key={s}>{s}</div>)}</div>}
                                        </div></button>;
                                })}
                            </div>
                            {/* NEW: Custom Input Area */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    {language === 'zh' ? '自定义策略 (实验性)' : 'Custom Strategy (Experimental)'}
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={customActionText} 
                                        onChange={(e) => setCustomActionText(e.target.value)}
                                        placeholder={language === 'zh' ? '输入你的行动...' : 'Enter your action...'}
                                        disabled={!isPlayerTurn || isAnalyzingAction}
                                        className="flex-grow bg-slate-800/50 text-white text-sm rounded-lg p-2 border border-slate-700 focus:border-blue-500 focus:outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomAction()}
                                    />
                                    <button 
                                        onClick={handleCustomAction}
                                        disabled={!isPlayerTurn || isAnalyzingAction || !customActionText.trim()}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all"
                                    >
                                        {isAnalyzingAction ? '...' : 'Go'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {isPlayerTurn && stateDecision && targetStateForDecision && (
                         <div className="flex flex-col animate-fadeIn border-l-2 border-red-500 pl-4 py-2 bg-red-900/10 rounded-r-lg mb-4">
                            <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
                                {t.stateDispatchTitle.replace('{stateName}', STATE_ABBR_TO_NAME[targetStateForDecision] || targetStateForDecision)}
                            </h2>
                            <h3 className="text-lg font-bold text-white mb-2">{stateDecision.title[language]}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-2">{stateDecision.description[language]}</p>
                            <div className="text-xs font-bold text-red-400 animate-pulse flex items-center gap-2">
                                <span className="text-lg">📍</span> {t.clickMapToIntervene}
                            </div>
                        </div>
                    )}
                    {!isPlayerTurn && !turnSummaryData && <div className="flex-grow flex items-center justify-center text-gray-500 animate-pulse">{t.opponentMove}</div>}
                </div>
            </div>
            {diceRoll && <DiceRoll statName={diceRoll.roll.stat} statValue={playerProfile.stats[diceRoll.roll.stat]} difficulty={diceRoll.roll.difficulty} onRollComplete={handleDiceRollComplete} language={language} />}
            {activeProblem && <LocalProblemModal problem={activeProblem} onChoice={handleLocalProblemChoice} onClose={handleCloseLocalProblem} language={language} />}
            {focusStateAbbr && <StateFocusModal isOpen={!!focusStateAbbr} stateAbbr={focusStateAbbr} gameState={gameState} onChoice={handleSelectStateFocus} onClose={handleCloseStateFocus} language={language} />}
            {turnSummaryData && <TurnSummaryModal summary={turnSummaryData} onClose={handleContinueFromSummary} language={language} />}
            {isPolicyModalOpen && gameState && <SignaturePolicyModal isOpen={isPolicyModalOpen} gameState={gameState} onEnact={handleEnactPolicy} onClose={() => setIsPolicyModalOpen(false)} language={language} usedPolicyIds={usedPolicyIds} />}
            {stateDecision && targetStateForDecision && isStateEventModalOpen && (
                <StateEventModal 
                    event={stateDecision} 
                    stateAbbr={targetStateForDecision} 
                    onChoice={handleChoice} 
                    onClose={handleCloseStateEventModal} 
                    language={language} 
                    treasury={gameState.treasury}
                    influence={gameState.influence}
                />
            )}
        </div>
    );
};

export default GamePlay;