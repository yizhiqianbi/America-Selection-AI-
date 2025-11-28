
import React from 'react';
import { Language } from '../types';
import { ACHIEVEMENTS_LIST, UI_TEXT } from '../constants';

interface AchievementsProps {
    onBack: () => void;
    language: Language;
    unlockedIds: string[];
}

const Achievements: React.FC<AchievementsProps> = ({ onBack, language, unlockedIds }) => {
    const t = UI_TEXT[language];

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#020617] p-4 overflow-y-auto relative">
            <div className="absolute top-6 left-6 z-20">
                <button 
                    onClick={onBack}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold border border-gray-700 transition-all"
                >
                    ← {t.back}
                </button>
            </div>

            <div className="w-full max-w-6xl mt-12 mb-8 animate-fadeIn">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-600 mb-4 uppercase tracking-widest">
                        {t.achievementsTitle}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t.achievementsDesc}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ACHIEVEMENTS_LIST.map((achievement) => {
                        const isUnlocked = unlockedIds.includes(achievement.id);
                        
                        return (
                            <div 
                                key={achievement.id}
                                className={`relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden group
                                    ${isUnlocked 
                                        ? 'bg-slate-800/50 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                                        : 'bg-slate-900/50 border-white/5 grayscale opacity-60'
                                    }
                                `}
                            >
                                {/* Background Glow for unlocked */}
                                {isUnlocked && (
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
                                )}

                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`text-4xl ${isUnlocked ? 'animate-bounce-slow' : 'opacity-20'}`}>
                                        {achievement.icon}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-xl mb-1 ${isUnlocked ? 'text-amber-100' : 'text-gray-600'}`}>
                                            {achievement.title[language]}
                                        </h3>
                                        <p className={`text-sm leading-relaxed ${isUnlocked ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {isUnlocked ? achievement.description[language] : t.locked}
                                        </p>
                                    </div>
                                </div>
                                
                                {!isUnlocked && (
                                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Achievements;