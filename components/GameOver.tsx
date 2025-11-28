
import React from 'react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface GameOverProps {
    reason: string;
    onRestart: () => void;
    language: Language;
}

const GameOver: React.FC<GameOverProps> = ({ reason, onRestart, language }) => {
    const t = UI_TEXT[language];
    // Heuristic to detect win/loss if language is mixed or unknown, default to red if unsure
    const isWin = reason.includes('Win') || reason.includes('Victory') || reason.includes('胜') || reason.includes('赢');

    return (
        <div className="flex flex-col items-center justify-center h-screen animate-fadeIn text-center p-6">
            <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${isWin ? 'text-green-400' : 'text-red-500'}`}>
                {isWin ? t.victory : t.defeat}
            </h1>
            <div className="max-w-xl bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">{reason}</p>
                <button
                    onClick={onRestart}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                >
                    {t.restart}
                </button>
            </div>
        </div>
    );
};

export default GameOver;
