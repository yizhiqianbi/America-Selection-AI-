
import React, { useState } from 'react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface MainMenuProps {
    onStart: (lang: Language) => void;
    onViewAchievements: (lang: Language) => void;
    initialLanguage: Language;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onViewAchievements, initialLanguage }) => {
    const [lang, setLang] = useState<Language>(initialLanguage);
    const t = UI_TEXT[lang];

    return (
        <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden bg-[#020617]">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl"></div>

            {/* Language Toggle */}
            <div className="absolute top-6 right-6 z-20 flex space-x-2 bg-slate-800/50 rounded-full p-1 border border-white/10 backdrop-blur-sm">
                <button 
                    onClick={() => setLang('en')}
                    className={`px-4 py-1 rounded-full text-sm font-bold transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLang('zh')}
                    className={`px-4 py-1 rounded-full text-sm font-bold transition-all ${lang === 'zh' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    中文
                </button>
            </div>

            <div className="z-10 text-center animate-fadeIn glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl mx-4 max-w-full">
                <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2 tracking-tighter">
                    2028
                </h1>
                <h2 className="text-xl md:text-3xl font-bold text-blue-400 tracking-[0.5em] uppercase mb-12">
                    {t.title}
                </h2>
                
                <div className="space-y-6 flex flex-col items-center">
                    <button
                        onClick={() => onStart(lang)}
                        className="w-full md:w-64 group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_rgba(37,99,235,0.8)] hover:-translate-y-1"
                    >
                        {t.start}
                        <div className="absolute inset-0 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40"></div>
                    </button>
                    
                    <button
                        onClick={() => onViewAchievements(lang)}
                        className="w-full md:w-64 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-bold rounded-lg text-lg transition-all border border-gray-700"
                    >
                        {t.achievements}
                    </button>
                </div>
                
                <div className="mt-12 text-xs text-gray-500 uppercase tracking-widest">
                    {t.poweredBy}
                </div>
            </div>
        </div>
    );
};

export default MainMenu;