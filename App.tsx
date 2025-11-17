
import React, { useState, useCallback } from 'react';
import MainMenu from './components/MainMenu';
import CharacterCreation from './components/CharacterCreation';
import TalentSelection from './components/TalentSelection';
import GamePlay from './components/GamePlay';
import GameOver from './components/GameOver';
import { GameScreen, PlayerProfile, Talent } from './types';

const App: React.FC = () => {
    const [gameScreen, setGameScreen] = useState<GameScreen>(GameScreen.MainMenu);
    const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
    const [gameOverReason, setGameOverReason] = useState<string>('');

    const handleStart = useCallback(() => {
        setGameScreen(GameScreen.CharacterCreation);
    }, []);

    const handleCharacterCreated = useCallback((profile: Omit<PlayerProfile, 'talents'>) => {
        setPlayerProfile({ ...profile, talents: [] });
        setGameScreen(GameScreen.TalentSelection);
    }, []);
    
    const handleTalentsSelected = useCallback((talents: Talent[]) => {
        if (playerProfile) {
            setPlayerProfile(prevProfile => prevProfile ? { ...prevProfile, talents } : null);
            setGameScreen(GameScreen.Gameplay);
        }
    }, [playerProfile]);

    const handleGameOver = useCallback((reason: string) => {
        setGameOverReason(reason);
        setGameScreen(GameScreen.GameOver);
    }, []);

    const handleRestart = useCallback(() => {
        setPlayerProfile(null);
        setGameOverReason('');
        setGameScreen(GameScreen.MainMenu);
    }, []);

    const renderScreen = () => {
        switch (gameScreen) {
            case GameScreen.MainMenu:
                return <MainMenu onStart={handleStart} />;
            case GameScreen.CharacterCreation:
                return <CharacterCreation onCharacterCreated={handleCharacterCreated} />;
            case GameScreen.TalentSelection:
                if (playerProfile) {
                    return <TalentSelection onTalentsSelected={handleTalentsSelected} />;
                }
                return null; // Should not happen
            case GameScreen.Gameplay:
                if (playerProfile) {
                    return <GamePlay playerProfile={playerProfile} onGameOver={handleGameOver} />;
                }
                return null; // Should not happen
            case GameScreen.GameOver:
                return <GameOver reason={gameOverReason} onRestart={handleRestart} />;
            default:
                return <MainMenu onStart={handleStart} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-4xl mx-auto">
                {renderScreen()}
            </div>
        </div>
    );
};

export default App;
