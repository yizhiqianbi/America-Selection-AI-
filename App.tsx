
import React, { useState, useCallback, useEffect, useRef } from 'react';
import MainMenu from './components/MainMenu';
import CharacterCreation from './components/CharacterCreation';
import TalentSelection from './components/TalentSelection';
import GamePlay from './components/GamePlay';
import GameOver from './components/GameOver';
import Achievements from './components/Achievements';
import { GameScreen, PlayerProfile, Talent, Language, CharacterStats } from './types';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { TALENT_EFFECTS, MAX_STAT_POINTS } from './constants';

const App: React.FC = () => {
    const [gameScreen, setGameScreen] = useState<GameScreen>(GameScreen.MainMenu);
    const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
    const [gameOverReason, setGameOverReason] = useState<string>('');
    const [language, setLanguage] = useState<Language>('zh');
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const { startMusic } = useBackgroundMusic();
    const musicStartedRef = useRef(false);

    // Load achievements from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('unlockedAchievements');
        if (stored) {
            try {
                setUnlockedAchievements(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse achievements", e);
            }
        }
    }, []);

    const handleUnlockAchievement = useCallback((id: string) => {
        setUnlockedAchievements(prev => {
            if (prev.includes(id)) return prev;
            const next = [...prev, id];
            localStorage.setItem('unlockedAchievements', JSON.stringify(next));
            return next;
        });
    }, []);

    const setScreen = (screen: GameScreen) => {
        setGameScreen(screen);
    };

    const handleStart = useCallback((lang: Language) => {
        if (!musicStartedRef.current) {
            startMusic();
            musicStartedRef.current = true;
        }
        setLanguage(lang);
        setScreen(GameScreen.CharacterCreation);
    }, [startMusic]);

    const handleViewAchievements = useCallback((lang: Language) => {
        if (!musicStartedRef.current) {
            startMusic();
            musicStartedRef.current = true;
        }
        setLanguage(lang);
        setScreen(GameScreen.Achievements);
    }, [startMusic]);

    const handleCharacterCreated = useCallback((profile: Omit<PlayerProfile, 'talents'>) => {
        setPlayerProfile({ ...profile, talents: [] });
        setScreen(GameScreen.TalentSelection);
    }, []);
    
    const handleTalentsSelected = useCallback((talents: Talent[]) => {
        if (playerProfile) {
            // Create a mutable copy of stats
            const newStats = { ...playerProfile.stats };
            
            // Apply effects from talents
            talents.forEach(talent => {
                const effect = TALENT_EFFECTS[talent.name.en];
                if (effect) {
                    // Loop through each stat change in the effect object (e.g., { appealing: 1 })
                    for (const stat in effect) {
                        const key = stat as keyof CharacterStats;
                        const boost = effect[key]!;
                        // Update the stat, ensuring it doesn't exceed the max value
                        newStats[key] = Math.min(MAX_STAT_POINTS, newStats[key] + boost);
                    }
                }
            });

            // Update the player profile with the new talents and modified stats
            setPlayerProfile(prevProfile => 
                prevProfile 
                    ? { ...prevProfile, talents, stats: newStats } 
                    : null
            );
            setScreen(GameScreen.Gameplay);
        }
    }, [playerProfile]);

    const handleGameOver = useCallback((reason: string) => {
        setGameOverReason(reason);
        setScreen(GameScreen.GameOver);
    }, []);

    const handleRestart = useCallback(() => {
        setPlayerProfile(null);
        setGameOverReason('');
        setScreen(GameScreen.MainMenu);
    }, []);

    const renderScreen = () => {
        switch (gameScreen) {
            case GameScreen.MainMenu:
                return <MainMenu onStart={handleStart} onViewAchievements={handleViewAchievements} initialLanguage={language} />;
            case GameScreen.Achievements:
                return <Achievements onBack={() => setScreen(GameScreen.MainMenu)} language={language} unlockedIds={unlockedAchievements} />;
            case GameScreen.CharacterCreation:
                return <CharacterCreation onCharacterCreated={handleCharacterCreated} language={language} />;
            case GameScreen.TalentSelection:
                if (playerProfile) {
                    return <TalentSelection onTalentsSelected={handleTalentsSelected} language={language} />;
                }
                return null;
            case GameScreen.Gameplay:
                if (playerProfile) {
                    return <GamePlay 
                        playerProfile={playerProfile} 
                        onGameOver={handleGameOver} 
                        language={language} 
                        onUnlockAchievement={handleUnlockAchievement}
                    />;
                }
                return null;
            case GameScreen.GameOver:
                return <GameOver reason={gameOverReason} onRestart={handleRestart} language={language} />;
            default:
                return <MainMenu onStart={handleStart} onViewAchievements={handleViewAchievements} initialLanguage={language} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center font-sans overflow-hidden">
            <div className="w-full h-full">
                {renderScreen()}
            </div>
        </div>
    );
};

export default App;
