import React, { useState, useMemo } from 'react';
import { Party, CharacterStats, PlayerProfile } from '../types';
import { TOTAL_STAT_POINTS, MIN_STAT_POINTS, MAX_STAT_POINTS } from '../constants';

interface CharacterCreationProps {
    onCharacterCreated: (profile: Omit<PlayerProfile, 'talents'>) => void;
}

const STAT_HINTS: Record<keyof CharacterStats, string> = {
    appealing: '影响你的公众形象和演讲效果。',
    policySkill: '在辩论和政策讨论中给予你优势。',
    organization: '增强你的筹款能力和竞选活动的动员力。',
    integrity: '帮助你抵御丑闻并赢得选民的信任。',
};

const StatSlider: React.FC<{ 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    onFocus: () => void;
    onBlur: () => void;
}> = ({ label, value, onChange, onFocus, onBlur }) => (
    <div className="flex items-center space-x-4">
        <label className="w-28 text-sm font-medium text-gray-300">{label}</label>
        <input
            type="range"
            min={MIN_STAT_POINTS}
            max={MAX_STAT_POINTS}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            onMouseEnter={onFocus}
            onMouseLeave={onBlur}
            onTouchStart={onFocus}
            onTouchEnd={onBlur}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="w-8 text-center font-semibold text-white">{value}</span>
    </div>
);


const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreated }) => {
    const [name, setName] = useState('');
    const [party, setParty] = useState<Party>(Party.Republican);
    const [slogan, setSlogan] = useState('');
    const [stats, setStats] = useState<CharacterStats>({
        appealing: MIN_STAT_POINTS,
        policySkill: MIN_STAT_POINTS,
        organization: MIN_STAT_POINTS,
        integrity: MIN_STAT_POINTS,
    });
    const [activeHint, setActiveHint] = useState<string>('调整属性滑块以查看其效果。');

    const totalPointsUsed = useMemo(() => Object.values(stats).reduce((sum: number, val: number) => sum + val, 0), [stats]);
    const pointsLeft = TOTAL_STAT_POINTS - totalPointsUsed;

    const handleStatChange = (stat: keyof CharacterStats, value: number) => {
        const diff = value - stats[stat];
        if (pointsLeft - diff >= 0) {
            setStats(prev => ({ ...prev, [stat]: value }));
        }
    };

    const handleRandom = () => {
        let remainingPoints = TOTAL_STAT_POINTS - (Object.keys(stats).length * MIN_STAT_POINTS);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pointsLeft !== 0) {
            alert(`你必须用完所有 ${TOTAL_STAT_POINTS} 个属性点。你还剩 ${pointsLeft} 点。`);
            return;
        }
        if (!name.trim()) {
            alert('请输入候选人的名字。');
            return;
        }
        onCharacterCreated({ name, party, slogan, stats });
    };

    return (
        <div className="bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold text-center text-white mb-6">创建你的候选人</h1>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-300 border-b border-gray-600 pb-2">基本信息</h2>
                        <div>
                            <label className="block text-lg font-medium text-gray-300 mb-2">姓名:</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="你的名字" className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-300 mb-2">党派:</label>
                             <div className="flex rounded-md shadow-sm">
                                <button type="button" onClick={() => setParty(Party.Republican)} className={`flex-1 p-2 rounded-l-md transition-colors ${party === Party.Republican ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-red-800'}`}>{Party.Republican}</button>
                                <button type="button" onClick={() => setParty(Party.Democrat)} className={`flex-1 p-2 rounded-r-md transition-colors ${party === Party.Democrat ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-blue-800'}`}>{Party.Democrat}</button>
                            </div>
                        </div>
                        <div>
                             <label className="block text-lg font-medium text-gray-300 mb-2">口号:</label>
                             <textarea value={slogan} onChange={e => setSlogan(e.target.value)} placeholder="输入竞选口号..." rows={4} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                        </div>
                    </div>

                    {/* Middle Column */}
                    <div className="flex items-center justify-center">
                        <div className="w-48 h-48 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>

                    {/* Right Column */}
                     <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-300 border-b border-gray-600 pb-2">分配属性点</h2>
                        <StatSlider label="吸引力" value={stats.appealing} onChange={v => handleStatChange('appealing', v)} onFocus={() => setActiveHint(STAT_HINTS.appealing)} onBlur={() => setActiveHint('')} />
                        <StatSlider label="政策能力" value={stats.policySkill} onChange={v => handleStatChange('policySkill', v)} onFocus={() => setActiveHint(STAT_HINTS.policySkill)} onBlur={() => setActiveHint('')} />
                        <StatSlider label="组织能力" value={stats.organization} onChange={v => handleStatChange('organization', v)} onFocus={() => setActiveHint(STAT_HINTS.organization)} onBlur={() => setActiveHint('')} />
                        <StatSlider label="诚信" value={stats.integrity} onChange={v => handleStatChange('integrity', v)} onFocus={() => setActiveHint(STAT_HINTS.integrity)} onBlur={() => setActiveHint('')} />
                        
                        <div className="text-center pt-2 h-10">
                            <p className="text-sm text-gray-400 italic transition-opacity duration-300">{activeHint || `剩余点数: ${pointsLeft}`}</p>
                        </div>

                        <div className="text-center">
                            <p className="text-lg font-bold text-white">剩余点数: <span className={pointsLeft === 0 ? "text-green-400" : "text-yellow-400"}>{pointsLeft}</span></p>
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button type="button" onClick={handleRandom} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">随机分配</button>
                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">开始竞选</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CharacterCreation;