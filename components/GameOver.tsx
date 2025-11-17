import React from 'react';

interface GameOverProps {
    reason: string;
    onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ reason, onRestart }) => {
    const isWin = reason.includes('赢得') || reason.includes('当选');

    return (
        <div className="flex flex-col items-center justify-center h-screen animate-fadeIn text-center">
            <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${isWin ? 'text-green-400' : 'text-red-500'}`}>
                {isWin ? '胜利！' : '竞选结束'}
            </h1>
            <div className="max-w-xl bg-gray-800 p-6 rounded-xl shadow-2xl">
                <p className="text-lg text-gray-300 mb-8">{reason}</p>
                <button
                    onClick={onRestart}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105"
                >
                    再玩一次
                </button>
            </div>
        </div>
    );
};

export default GameOver;
