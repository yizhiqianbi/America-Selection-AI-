
import React, { useState, useMemo, useCallback } from 'react';
import { Talent, Language, CharacterStats } from '../types';
import { ALL_TALENTS, TALENTS_TO_SHOW, TALENTS_TO_PICK, UI_TEXT, TALENT_EFFECTS, STAT_DISPLAY_NAMES } from '../constants';

interface TalentSelectionProps {
    onTalentsSelected: (talents: Talent[]) => void;
    language: Language;
}

const TalentSelection: React.FC<TalentSelectionProps> = ({ onTalentsSelected, language }) => {
    const [selectedTalents, setSelectedTalents] = useState<Talent[]>([]);
    const t = UI_TEXT[language];

    const availableTalents = useMemo(() => {
        const shuffled = [...ALL_TALENTS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, TALENTS_TO_SHOW);
    }, []);

    const handleTalentClick = useCallback((talent: Talent) => {
        setSelectedTalents(prev => {
            if (prev.find(t => t.name.en === talent.name.en)) {
                return prev.filter(t => t.name.en !== talent.name.en);
            }
            if (prev.length < TALENTS_TO_PICK) {
                return [...prev, talent];
            }
            return prev;
        });
    }, []);

    const canConfirm = selectedTalents.length === TALENTS_TO_PICK;

    const getStatColor = (stat: string) => {
        switch (stat) {
            case 'appealing': return 'bg-purple-900 text-purple-200 border-purple-500';
            case 'policySkill': return 'bg-blue-900 text-blue-200 border-blue-500';
            case 'organization': return 'bg-orange-900 text-orange-200 border-orange-500';
            case 'integrity': return 'bg-emerald-900 text-emerald-200 border-emerald-500';
            default: return 'bg-gray-800 text-gray-300 border-gray-600';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 overflow-y-auto">
            <div className="glass-panel w-full max-w-6xl p-8 rounded-3xl shadow-2xl animate-fadeIn border border-white/5 my-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">{t.selectTalents}</h1>
                    <p className="text-gray-400">{language === 'en' ? `Choose ${TALENTS_TO_PICK} ${t.pickTalents}` : `选择 ${TALENTS_TO_PICK} ${t.pickTalents}`}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                    {availableTalents.map(talent => {
                        const isSelected = selectedTalents.some(t => t.name.en === talent.name.en);
                        // Using English name as key for effects lookup as it is stable
                        const talentEffect = TALENT_EFFECTS[talent.name.en] || TALENT_EFFECTS[talent.name.zh];
                        return (
                            <div
                                key={talent.id}
                                onClick={() => handleTalentClick(talent)}
                                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border flex flex-col h-full relative group ${isSelected ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transform -translate-y-1' : 'bg-slate-800/50 border-gray-700 hover:border-gray-500'}`}
                            >
                                <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-white' : 'text-gray-300'}`}>{talent.name[language]}</h3>
                                <p className="text-xs text-gray-400 flex-grow leading-relaxed">{talent.description[language]}</p>
                                {talentEffect && (
                                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                                        {Object.entries(talentEffect).map(([stat, value]) => (
                                            <span 
                                                key={stat} 
                                                className={`text-[10px] font-bold px-2 py-1 rounded border ${getStatColor(stat)}`}
                                            >
                                                {value > 0 ? '+' : ''}{value} {STAT_DISPLAY_NAMES[stat as keyof CharacterStats][language]}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_5px_rgba(59,130,246,1)]"></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={() => setSelectedTalents([])}
                        disabled={selectedTalents.length === 0}
                        className="w-48 py-4 rounded-xl font-bold text-lg tracking-widest transition-all bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {language === 'en' ? 'Reset' : '重置'}
                    </button>
                    <button
                        onClick={() => onTalentsSelected(selectedTalents)}
                        disabled={!canConfirm}
                        className={`w-64 py-4 rounded-xl font-bold text-xl tracking-widest transition-all shadow-lg ${canConfirm ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-500/30' : 'bg-slate-800 text-gray-600'}`}
                    >
                        {t.confirm} ({selectedTalents.length}/{TALENTS_TO_PICK})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TalentSelection;
