import React, { useState, useEffect, useMemo } from 'react';
import { CharacterStats, RollOutcome, Language } from '../types';
import { STAT_DISPLAY_NAMES, UI_TEXT } from '../constants';

interface DiceRollProps {
    statName: keyof CharacterStats;
    statValue: number;
    difficulty: number;
    onRollComplete: (outcome: RollOutcome) => void;
    language: Language;
}

const DiceRoll: React.FC<DiceRollProps> = ({ statName, statValue, difficulty, onRollComplete, language }) => {
    const [phase, setPhase] = useState<'rolling' | 'calculating' | 'result'>('rolling');
    const [rollValue, setRollValue] = useState(0);
    const [finalRoll, setFinalRoll] = useState(0);
    const t = UI_TEXT[language];

    const modifier = useMemo(() => Math.floor(statValue - 5), [statValue]);
    const total = useMemo(() => finalRoll + modifier, [finalRoll, modifier]);
    const outcome = useMemo<RollOutcome>(() => {
        if (finalRoll === 1) return 'Critical Failure';
        if (finalRoll === 20) return 'Critical Success';
        if (total >= difficulty) return 'Success';
        return 'Failure';
    }, [finalRoll, total, difficulty]);

    useEffect(() => {
        // --- Rolling Phase ---
        const roll = Math.floor(Math.random() * 20) + 1;
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            setRollValue(Math.floor(Math.random() * 20) + 1);
            rollCount++;
            if (rollCount > 15) { // Stop flickering after ~1.5s
                clearInterval(rollInterval);
                setFinalRoll(roll);
                setPhase('calculating');
            }
        }, 100);

        return () => clearInterval(rollInterval);
    }, []);

    useEffect(() => {
        if (phase === 'calculating') {
            // --- Calculating Phase ---
            const timer = setTimeout(() => {
                setPhase('result');
            }, 1000);
            return () => clearTimeout(timer);
        } else if (phase === 'result') {
            // --- Result Phase ---
            const timer = setTimeout(() => {
                onRollComplete(outcome);
            }, 1500); // Wait 1.5s before closing
            return () => clearTimeout(timer);
        }
    }, [phase, onRollComplete, outcome]);

    const resultStyles: {[key in RollOutcome]: string} = {
        'Critical Success': 'text-cyan-400 border-cyan-400',
        'Success': 'text-green-400 border-green-400',
        'Failure': 'text-rose-500 border-rose-500',
        'Critical Failure': 'text-red-600 border-red-600'
    };

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/80 border border-white/10 rounded-2xl p-8 text-center animate-roll-in">
                <h2 className="text-2xl font-black text-blue-400 uppercase tracking-widest mb-2">
                    {STAT_DISPLAY_NAMES[statName][language]} {t.statCheck}
                </h2>
                <div className="text-sm text-gray-400 mb-6">{t.difficulty}: <span className="font-bold text-white">{difficulty}</span></div>

                <div className="flex justify-center items-center gap-4 md:gap-6 my-8">
                    {/* Roll */}
                    <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 uppercase tracking-widest">{t.roll}</div>
                        <div className="text-6xl md:text-7xl font-black font-mono text-white animate-number-flicker">
                            {phase === 'rolling' ? rollValue : finalRoll}
                        </div>
                    </div>
                    {/* Modifier */}
                    <div className={`text-4xl font-bold transition-opacity duration-500 ${phase === 'rolling' ? 'opacity-0' : 'opacity-100'}`}>+</div>
                    <div className={`flex flex-col items-center transition-opacity duration-500 ${phase === 'rolling' ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">{t.bonus}</div>
                        <div className={`text-6xl md:text-7xl font-black font-mono ${modifier >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {modifier >= 0 ? `+${modifier}` : modifier}
                        </div>
                    </div>
                     {/* Total */}
                    <div className={`text-4xl font-bold transition-opacity duration-500 ${phase !== 'result' ? 'opacity-0' : 'opacity-100'}`}>=</div>
                     <div className={`flex flex-col items-center transition-opacity duration-500 ${phase !== 'result' ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">{t.total}</div>
                        <div className={`text-6xl md:text-7xl font-black font-mono text-amber-400`}>
                            {total}
                        </div>
                    </div>
                </div>

                {phase === 'result' && (
                     <div className={`mt-8 animate-result-pop border-2 rounded-lg py-3 px-6 inline-block ${resultStyles[outcome]}`}>
                        <div className="text-3xl font-black tracking-widest">{outcome.toUpperCase()}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiceRoll;