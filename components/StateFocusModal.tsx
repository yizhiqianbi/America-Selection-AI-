import React from 'react';
import { GameState, Language } from '../types';
import { STATE_FOCUS_OPTIONS, STATE_ABBR_TO_NAME, UI_TEXT } from '../constants';

// Define the type for a focus option here to avoid touching types.ts
type StateFocusOption = typeof STATE_FOCUS_OPTIONS[0];

interface StateFocusModalProps {
    isOpen: boolean;
    stateAbbr: string;
    gameState: GameState;
    onChoice: (choice: StateFocusOption) => void;
    onClose: () => void;
    language: Language;
}

const StateFocusModal: React.FC<StateFocusModalProps> = ({ isOpen, stateAbbr, gameState, onChoice, onClose, language }) => {
    if (!isOpen) return null;

    const t = UI_TEXT[language];
    const stateName = STATE_ABBR_TO_NAME[stateAbbr] || stateAbbr;

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="w-full max-w-2xl bg-slate-900/90 border border-cyan-500/30 rounded-2xl shadow-2xl p-8 animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">{t.stateFocusTitle.replace('{stateName}', stateName)}</div>
                    <p className="text-gray-300 mb-6 leading-relaxed text-base">{t.stateFocusDesc}</p>
                </div>
                
                <div className="flex flex-col gap-4">
                    {STATE_FOCUS_OPTIONS.map((option) => {
                        const canAffordInfluence = gameState.influence >= (option.cost.influence ?? 0);
                        const canAffordTreasury = gameState.treasury >= (option.cost.treasury ?? 0);
                        const canAfford = canAffordInfluence && canAffordTreasury;

                        const costString = [
                            option.cost.influence && `${option.cost.influence} ${t.influence}`,
                            option.cost.treasury && `$${option.cost.treasury}M`
                        ].filter(Boolean).join(' / ');

                        return (
                            <button
                                key={option.id}
                                onClick={() => onChoice(option)}
                                disabled={!canAfford}
                                className="w-full text-left p-4 rounded-xl border bg-slate-800/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-cyan-600/50 enabled:hover:border-cyan-400 border-slate-700"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-lg text-gray-200 group-enabled:group-hover:text-white">{option.name[language]}</div>
                                        <div className="text-xs text-gray-400 mt-1 italic group-enabled:group-hover:text-cyan-200">{option.description[language]}</div>
                                    </div>
                                    <div className="text-right text-xs ml-4 flex-shrink-0">
                                        <div className={`font-bold ${canAfford ? 'text-gray-300' : 'text-red-400'}`}>
                                            {t.cost}: {costString}
                                        </div>
                                        <div className="text-gray-400">{t.duration}: {option.duration} {t.turns}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-white/10">
                                    <span className="font-bold text-cyan-300">{t.effect}: </span>{option.effectDescription[language]}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default StateFocusModal;
