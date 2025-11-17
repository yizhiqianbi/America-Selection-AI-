import React from 'react';

interface MainMenuProps {
    onStart: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen animate-fadeIn">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-wider">
                总统大选模拟器
            </h1>
            <p className="text-xl text-gray-400 mb-12">US Election Simulator</p>
            <div className="space-y-4">
                <button
                    onClick={onStart}
                    className="w-48 bg-gray-300 hover:bg-white text-gray-800 font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105"
                >
                    启动
                </button>
                <button
                    onClick={() => alert('成就功能即将推出!')}
                    className="w-48 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105"
                >
                    成就
                </button>
            </div>
        </div>
    );
};

export default MainMenu;
