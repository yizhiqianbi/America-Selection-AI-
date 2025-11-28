import React from 'react';
import { GameEvent, GameEventChoice, Language } from '../types';
import { UI_TEXT, STATE_ABBR_TO_NAME } from '../constants';

interface StateEventModalProps {
    event: GameEvent;
    stateAbbr: string;
    onChoice: (choice: GameEventChoice) => void;
    onClose: () => void;
    language: Language;
    treasury: number;
    influence: number;
}

const StateEventModal: React.FC<StateEventModalProps> = ({ event, stateAbbr, onChoice, onClose, language, treasury, influence }) => {
    const t = UI_TEXT[language];
    const stateName = STATE_ABBR_TO_NAME[stateAbbr] || stateAbbr;

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="w-full max-w-2xl bg-slate-900/90 border border-red-500/50 rounded-2xl shadow-2xl p-8 text-center animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    {t.stateDispatchTitle.replace('{stateName}', stateName)}
                </div>
                <h2 className="text-3xl font-black text-white mb-4">{event.title[language]}</h2>
                <p className="text-gray-300 mb-8 leading-relaxed text-base">{event.description[language]}</p>
                
                <div className="grid grid-cols-1 gap-4">
                    {event.choices.map((choice, idx) => {
                         const canAfford = treasury >= (choice.cost ?? 0) && influence >= (choice.influenceCost ?? 0);
                         const costString = [
                            choice.cost && `$${choice.cost}M`, 
                            choice.influenceCost && `${choice.influenceCost} ${t.influence}`
                        ].filter(Boolean).join(' / ');

                        return (
                            <button
                                key={idx}
                                onClick={() => onChoice(choice)}
                                disabled={!canAfford}
                                className="w-full text-left p-5 rounded-xl border border-slate-700 bg-slate-800/50 transition-all group enabled:hover:bg-red-900/30 enabled:hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-lg text-gray-200 group-enabled:group-hover:text-white">{choice.text[language]}</div>
                                        <div className="text-xs text-gray-500 mt-1 italic group-enabled:group-hover:text-red-200">{choice.outcomeHint[language]}</div>
                                    </div>
                                    {costString && (
                                        <div className={`ml-4 text-right text-xs font-bold flex-shrink-0 ${canAfford ? 'text-gray-400' : 'text-red-500'}`}>
                                            {costString.split(' / ').map(s => <div key={s}>{s}</div>)}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StateEventModal;