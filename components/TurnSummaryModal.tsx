
import React from 'react';
import { Language, StateAffiliation, Party } from '../types';
import { UI_TEXT, STATE_ABBR_TO_NAME } from '../constants';

// Define type inline to avoid touching types.ts
interface TurnSummaryData {
    player: { polls: number; treasury: number; scandal: number; politicalCapital: number; };
    opponent: { polls: number; scandal: number; };
    flippedStates: { state: string; from: StateAffiliation; to: StateAffiliation; }[];
}

interface TurnSummaryModalProps {
    summary: TurnSummaryData;
    onClose: () => void;
    language: Language;
}

const StatChange: React.FC<{ label: string; value: number; isPercentage?: boolean; isMoney?: boolean }> = ({ label, value, isPercentage, isMoney }) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    const sign = isPositive ? '+' : '';
    const unit = isPercentage ? '%' : isMoney ? 'M' : '';
    const prefix = isMoney ? '$' : (label === UI_TEXT.en.politicalCapital || label === UI_TEXT.zh.politicalCapital ? '⭐ ' : '');

    return (
        <div className="flex justify-between text-lg">
            <span className="text-gray-300">{label}:</span>
            <span className={`font-bold font-mono ${color}`}>{sign}{prefix}{value}{unit}</span>
        </div>
    );
};

const TurnSummaryModal: React.FC<TurnSummaryModalProps> = ({ summary, onClose, language }) => {
    const t = UI_TEXT[language];

    const getAffiliationText = (affiliation: StateAffiliation) => {
        switch (affiliation) {
            case StateAffiliation.Player: return language === 'zh' ? '我方' : 'Player';
            case StateAffiliation.Opponent: return language === 'zh' ? '对手' : 'Opponent';
            case StateAffiliation.Swing: return language === 'zh' ? '摇摆' : 'Swing';
            default: return '';
        }
    };

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-4">
            <div 
                className="w-full max-w-lg bg-slate-900/90 border border-blue-500/30 rounded-2xl shadow-2xl p-8 animate-slide-up"
            >
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-white">{t.turnSummaryTitle}</h2>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-blue-400 mb-2">{t.yourCampaign}</h3>
                        <div className="space-y-1 glass-panel p-4 rounded-lg">
                            <StatChange label={t.polls} value={summary.player.polls} isPercentage />
                            <StatChange label={t.treasury} value={summary.player.treasury} isMoney />
                            <StatChange label={t.politicalCapital} value={summary.player.politicalCapital} />
                            <StatChange label={t.scandal} value={summary.player.scandal} isPercentage />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-red-400 mb-2">{t.opponentCampaign}</h3>
                        <div className="space-y-1 glass-panel p-4 rounded-lg">
                            <StatChange label={t.polls} value={summary.opponent.polls} isPercentage />
                            <StatChange label={t.scandal} value={summary.opponent.scandal} isPercentage />
                        </div>
                    </div>

                    {summary.flippedStates.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-amber-400 mb-2">{t.statesFlipped}</h3>
                             <div className="space-y-1 glass-panel p-4 rounded-lg max-h-32 overflow-y-auto custom-scrollbar">
                                {summary.flippedStates.map(({ state, from, to }) => (
                                    <div key={state} className="text-gray-300 text-sm">
                                        - <span className="font-bold text-white">{STATE_ABBR_TO_NAME[state] || state}</span>: {getAffiliationText(from)} → {getAffiliationText(to)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.8)]"
                    >
                        {t.continue}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TurnSummaryModal;
