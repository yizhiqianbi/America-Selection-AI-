import React, { useState, useMemo, useEffect } from 'react';
import { Party, CharacterStats, PlayerProfile, Language, Difficulty } from '../types';
import { TOTAL_STAT_POINTS, MIN_STAT_POINTS, MAX_STAT_POINTS, UI_TEXT, RANDOM_CANDIDATE_PROFILES, STAT_DISPLAY_NAMES } from '../constants';

interface CharacterCreationProps {
    onCharacterCreated: (profile: Omit<PlayerProfile, 'talents'>) => void;
    language: Language;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreated, language }) => {
    const t = UI_TEXT[language];
    const [name, setName] = useState('');
    const [party, setParty] = useState<Party>(Party.Republican);
    const [slogan, setSlogan] = useState('');
    const [biography, setBiography] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Normal);
    const [stats, setStats] = useState<CharacterStats>({
        appealing: 5, policySkill: 5, organization: 5, integrity: 5,
    });
    const [statError, setStatError] = useState<boolean>(false);

    const totalPointsUsed = useMemo(() => Object.values(stats).reduce((sum: number, val: number) => sum + val, 0), [stats]);
    const pointsLeft = TOTAL_STAT_POINTS - totalPointsUsed;

    const handleStatChange = (stat: keyof CharacterStats, value: number) => {
        const diff = value - stats[stat];
        if (pointsLeft - diff >= 0) {
            setStats(prev => ({ ...prev, [stat]: value }));
        }
    };

    useEffect(() => {
        if (pointsLeft === 0) {
            setStatError(false);
        }
    }, [pointsLeft]);

    const handleRandomizeStats = () => {
        let remainingPoints = TOTAL_STAT_POINTS - (4 * MIN_STAT_POINTS);
        const newStats: CharacterStats = { appealing: MIN_STAT_POINTS, policySkill: MIN_STAT_POINTS, organization: MIN_STAT_POINTS, integrity: MIN_STAT_POINTS };
        const statKeys = Object.keys(newStats) as (keyof CharacterStats)[];
        while (remainingPoints > 0) {
            const randomStat = statKeys[Math.floor(Math.random() * statKeys.length)];
            if (newStats[randomStat] < MAX_STAT_POINTS) {
                newStats[randomStat]++;
                remainingPoints--;
            }
        }
        setStats(newStats);
    };

    const handleRandomizeAll = () => {
        const profile = RANDOM_CANDIDATE_PROFILES[Math.floor(Math.random() * RANDOM_CANDIDATE_PROFILES.length)];
        setName(profile.name);
        setSlogan(profile.slogan[language]);
        setBiography(profile.biography[language]);
        setParty(Math.random() < 0.5 ? Party.Republican : Party.Democrat);
        handleRandomizeStats();
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pointsLeft !== 0) {
            setStatError(true);
            return;
        }
        if (!name.trim()) return;
        onCharacterCreated({ name, party, slogan, stats, biography, difficulty });
    };

    const StatSlider: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
        <div className="flex flex-col space-y-2 mb-4 group">
            <div className="flex justify-between text-sm font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                <label>{label}</label>
                <span>{value} / 10</span>
            </div>
            <div className="flex items-center space-x-4">
                <input
                    type="range"
                    min={MIN_STAT_POINTS}
                    max={MAX_STAT_POINTS}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 accent-blue-500"
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 overflow-y-auto">
            <div className="glass-panel w-full max-w-5xl p-6 md:p-8 rounded-3xl shadow-2xl animate-fadeIn border border-white/5 my-8">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-8 text-center uppercase tracking-widest">{t.characterTitle}</h1>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.fullName}</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t.namePlaceholder} className="w-full bg-slate-800/50 text-white text-xl rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.party}</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setParty(Party.Republican)} className={`p-4 rounded-lg border transition-all ${party === Party.Republican ? 'bg-red-900/50 border-red-500 text-white' : 'bg-slate-800 border-gray-700 text-gray-400'}`}>
                                    <div className="font-bold text-lg">{t.republican}</div>
                                </button>
                                <button type="button" onClick={() => setParty(Party.Democrat)} className={`p-4 rounded-lg border transition-all ${party === Party.Democrat ? 'bg-blue-900/50 border-blue-500 text-white' : 'bg-slate-800 border-gray-700 text-gray-400'}`}>
                                    <div className="font-bold text-lg">{t.democrat}</div>
                                </button>
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.difficulty}</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => setDifficulty(Difficulty.Easy)} className={`p-3 text-sm rounded-lg border transition-all ${difficulty === Difficulty.Easy ? 'bg-green-900/50 border-green-500 text-white' : 'bg-slate-800 border-gray-700 text-gray-400'}`}>
                                    <div className="font-bold">{t.easy}</div>
                                </button>
                                <button type="button" onClick={() => setDifficulty(Difficulty.Normal)} className={`p-3 text-sm rounded-lg border transition-all ${difficulty === Difficulty.Normal ? 'bg-sky-900/50 border-sky-500 text-white' : 'bg-slate-800 border-gray-700 text-gray-400'}`}>
                                     <div className="font-bold">{t.normal}</div>
                                </button>
                                <button type="button" onClick={() => setDifficulty(Difficulty.Hard)} className={`p-3 text-sm rounded-lg border transition-all ${difficulty === Difficulty.Hard ? 'bg-rose-900/50 border-rose-500 text-white' : 'bg-slate-800 border-gray-700 text-gray-400'}`}>
                                     <div className="font-bold">{t.hard}</div>
                                </button>
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.slogan}</label>
                             <textarea value={slogan} onChange={e => setSlogan(e.target.value)} placeholder={t.sloganPlaceholder} rows={2} className="w-full bg-slate-800/50 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:outline-none transition-all"></textarea>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.biography}</label>
                             <textarea value={biography} onChange={e => setBiography(e.target.value)} placeholder={t.bioPlaceholder} rows={3} className="w-full bg-slate-800/50 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:outline-none transition-all"></textarea>
                        </div>
                    </div>

                    <div className={`lg:col-span-7 bg-slate-900/50 rounded-2xl p-6 border transition-all duration-300 ${statError ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-gray-700/50'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{t.attributes}</h2>
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={handleRandomizeStats} className="text-xs px-3 py-1 rounded border border-gray-600 hover:bg-gray-800 text-gray-400 font-bold">{t.randomizeStats}</button>
                                <div className={`text-sm font-mono font-bold px-3 py-1 rounded ${pointsLeft === 0 ? 'bg-green-900/50 text-green-400' : 'bg-amber-900/50 text-amber-400'}`}>
                                    {t.points}: {pointsLeft}
                                </div>
                            </div>
                        </div>

                        {statError && (
                            <div className="text-center text-red-400 text-sm -mt-4 mb-4 animate-fadeIn">
                                {language === 'en' ? `You must use exactly ${TOTAL_STAT_POINTS} points.` : `必须使用所有 ${TOTAL_STAT_POINTS} 个属性点。`}
                            </div>
                        )}
                        
                        <StatSlider label={STAT_DISPLAY_NAMES.appealing[language]} value={stats.appealing} onChange={v => handleStatChange('appealing', v)} />
                        <StatSlider label={STAT_DISPLAY_NAMES.policySkill[language]} value={stats.policySkill} onChange={v => handleStatChange('policySkill', v)} />
                        <StatSlider label={STAT_DISPLAY_NAMES.organization[language]} value={stats.organization} onChange={v => handleStatChange('organization', v)} />
                        <StatSlider label={STAT_DISPLAY_NAMES.integrity[language]} value={stats.integrity} onChange={v => handleStatChange('integrity', v)} />
                        
                        <div className="flex gap-4 mt-8">
                            <button type="button" onClick={handleRandomizeAll} className="flex-1 py-4 rounded-lg border border-purple-600 bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 font-bold">{t.randomizeAll}</button>
                            <button type="submit" className="flex-[2] py-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg">{t.launch}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CharacterCreation;