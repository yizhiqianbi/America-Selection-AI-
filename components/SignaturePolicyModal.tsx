
import React from 'react';
import { GameState, Language } from '../types';
import { SIGNATURE_POLICIES, UI_TEXT } from '../constants';

type EnrichedGameState = GameState & { politicalCapital: number };
type SignaturePolicy = typeof SIGNATURE_POLICIES[0];

interface SignaturePolicyModalProps {
    isOpen: boolean;
    gameState: EnrichedGameState;
    onEnact: (policy: SignaturePolicy) => void;
    onClose: () => void;
    language: Language;
    usedPolicyIds: string[];
}

const SignaturePolicyModal: React.FC<SignaturePolicyModalProps> = ({ isOpen, gameState, onEnact, onClose, language, usedPolicyIds }) => {
    if (!isOpen) return null;

    const t = UI_TEXT[language];

    const canAfford = (policy: SignaturePolicy) => {
        return (
            gameState.politicalCapital >= (policy.cost.politicalCapital ?? 0) &&
            gameState.treasury >= (policy.cost.treasury ?? 0) &&
            (gameState.influence >= (policy.cost as any).influence ?? 0)
        );
    };

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="w-full max-w-3xl bg-slate-900/90 border border-purple-500/30 rounded-2xl shadow-2xl p-8 animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-2">{t.signaturePolicies}</div>
                    <p className="text-gray-300 mb-6 leading-relaxed text-base">Spend Political Capital on game-changing executive actions.</p>
                </div>
                
                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {SIGNATURE_POLICIES.map((policy) => {
                        const isUsed = usedPolicyIds.includes(policy.id);
                        const isAffordable = canAfford(policy);
                        
                        const costString = Object.entries(policy.cost).map(([key, value]) => {
                            if (key === 'politicalCapital') return `${value} ⭐`;
                            if (key === 'treasury') return `$${value}M`;
                            if (key === 'influence') return `${value} ${t.influence}`;
                            return '';
                        }).filter(Boolean).join(' / ');

                        return (
                            <div
                                key={policy.id}
                                className={`w-full text-left p-4 rounded-xl border bg-slate-800/50 transition-all group ${isUsed ? 'opacity-40 grayscale' : ''} ${!isUsed && !isAffordable ? 'opacity-60' : ''}`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <div className="font-bold text-lg text-gray-200">{policy.name[language]}</div>
                                        <div className="text-xs text-gray-400 mt-1 italic">{policy.description[language]}</div>
                                    </div>
                                    <div className="text-right text-xs ml-4 flex-shrink-0">
                                        <button
                                            onClick={() => onEnact(policy)}
                                            disabled={!isAffordable || isUsed}
                                            className="px-4 py-2 rounded-lg font-bold text-sm bg-purple-600 text-white transition-all enabled:hover:bg-purple-500 disabled:bg-gray-600"
                                        >
                                            {isUsed ? (language === 'zh' ? '已颁布' : 'Enacted') : t.enactPolicy}
                                        </button>
                                        <div className={`mt-2 font-bold ${isAffordable ? 'text-gray-300' : 'text-red-400'}`}>
                                            Cost: {costString}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default SignaturePolicyModal;
