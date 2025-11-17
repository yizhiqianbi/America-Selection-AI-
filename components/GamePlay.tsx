import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerProfile, GameState, GameEvent, GameEventChoice, GeminiResponse } from '../types';
import { startGame, processTurn, generateEventImage } from '../services/geminiService';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { MAX_STAT_POINTS } from '../constants';

interface GamePlayProps {
    playerProfile: PlayerProfile;
    onGameOver: (reason: string) => void;
}

interface CampaignActionButtonProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    cost: number;
    disabled: boolean;
    onClick: () => void;
}

const CampaignActionButton: React.FC<CampaignActionButtonProps> = ({ icon, title, description, cost, disabled, onClick }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`bg-gray-700 p-4 rounded-lg text-left transition-all duration-200 flex flex-col justify-between h-full
            ${disabled 
                ? 'opacity-40 cursor-not-allowed' 
                : 'hover:bg-blue-800 hover:shadow-lg hover:scale-105'
            }`}
    >
        <div>
            <div className="flex items-center mb-2">
                <div className="w-8 h-8 mr-3 text-blue-300">{icon}</div>
                <h4 className="font-bold text-md text-white">{title}</h4>
            </div>
            <p className="text-xs text-gray-400">{description}</p>
        </div>
        <p className="text-sm font-semibold mt-3 text-right">
            {cost > 0 ? `成本: ${cost} 资金` : '无成本'}
        </p>
    </button>
);

const ProgressBar: React.FC<{ value: number, color: string, label: string }> = ({ value, color, label }) => (
    <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-400 w-8">{label}</span>
        <div className="w-full bg-gray-700 rounded-full h-5 relative overflow-hidden">
            <div 
                className={`h-5 rounded-full ${color} transition-all duration-500 ease-out flex items-center justify-end pr-2 text-white text-xs font-bold`} 
                style={{ width: `${value}%` }}>
            </div>
             <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                {value}
            </span>
        </div>
    </div>
);


const GamePlay: React.FC<GamePlayProps> = ({ playerProfile, onGameOver }) => {
    const [gameState, setGameState] = useState<GameState>({ approval: 50, funding: 50, scandalRisk: 10, progress: 0, opponentApproval: 50, opponentFunding: 50, opponentProfile: null });
    const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
    const [eventLog, setEventLog] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [turnMessage, setTurnMessage] = useState<string>('正在处理你的行动...');
    const eventLogRef = useRef<HTMLDivElement>(null);
    const autoPlayTimeoutRef = useRef<number | null>(null);

    const processApiResponse = useCallback((response: GeminiResponse, turnType: 'player' | 'opponent' | 'start'): boolean => {
        if(response.event?.choices[0]?.text === "重新开始游戏") {
             onGameOver("发生叙事错误，请重新开始。");
             return false;
        }

        if (turnType === 'player' || turnType === 'start') {
            setImageUrl(null); // Clear previous image
            setIsImageLoading(false);
            if (response.imagePrompt) {
                setIsImageLoading(true);
                generateEventImage(response.imagePrompt).then(url => {
                    setImageUrl(url);
                    setIsImageLoading(false);
                });
            }
        }
        
        const newLogEntries: string[] = [];
        if (response.narrative) newLogEntries.push(`[你的行动] ${response.narrative}`);
        if (response.opponentNarrative) newLogEntries.push(`[对手动态] ${response.opponentNarrative}`);
        if (newLogEntries.length > 0) {
            setEventLog(prev => [...prev, ...newLogEntries]);
        }
        
        if (response.isGameOver) {
            onGameOver(response.gameOverReason);
            return false;
        }
        
        const playerUpdates = response.gameStateUpdate || { approval: 0, funding: 0, scandalRisk: 0 };
        const opponentUpdates = response.opponentStateUpdate || { approval: 0, funding: 0 };
        
        setGameState(prev => {
            let approvalChangeForPlayer = 0;
            // On player's turn, the change is directly from gameStateUpdate.
            if (playerUpdates.approval !== 0) {
                approvalChangeForPlayer = playerUpdates.approval;
            } 
            // On opponent's turn, the player's change is the inverse of the opponent's change.
            else if (opponentUpdates.approval !== 0) {
                approvalChangeForPlayer = -opponentUpdates.approval;
            }

            const newApproval = Math.max(0, Math.min(100, prev.approval + approvalChangeForPlayer));
            const newOpponentApproval = 100 - newApproval; // Enforce zero-sum rule

            const newFunding = Math.max(0, Math.min(100, prev.funding + playerUpdates.funding + opponentUpdates.funding)); // opponent funding changes are separate
            const newOpponentFunding = Math.max(0, Math.min(100, prev.opponentFunding + opponentUpdates.funding));
            const newScandalRisk = Math.max(0, Math.min(100, prev.scandalRisk + playerUpdates.scandalRisk));

            if (newApproval <= 0) { onGameOver("你的支持率跌至零，竞选失败。"); return prev; }
            if (newFunding <= 0 && turnType === 'player') { onGameOver("你的竞选资金耗尽，竞选失败。"); return prev; }
            if (newScandalRisk >= 100) { onGameOver("一场巨大的丑闻爆发，你被迫退选。"); return prev; }

            return {
                ...prev,
                approval: newApproval,
                funding: newFunding,
                scandalRisk: newScandalRisk,
                opponentApproval: newOpponentApproval,
                opponentFunding: newOpponentFunding,
                opponentProfile: response.opponentProfile || prev.opponentProfile,
                progress: turnType === 'start' ? 0 : Math.min(100, prev.progress + 3 + Math.floor(Math.random() * 3)),
            };
        });

        if (response.event && response.event.choices.length > 0) {
            setCurrentEvent(response.event);
            setIsAutoPlay(false);
        } else if (turnType === 'player') {
            setCurrentEvent(null);
        }
        
        return true;

    }, [onGameOver]);


    const handleChoice = useCallback(async (choice: GameEventChoice) => {
        setIsLoading(true);
        setCurrentEvent(null);

        // Player's Turn
        setTurnMessage("正在处理你的行动...");
        const playerResponse = await processTurn(playerProfile, eventLog, gameState, 'player', choice);
        const gameContinues = processApiResponse(playerResponse, 'player');

        if (!gameContinues) {
            setIsLoading(false);
            return;
        }

        // Opponent's Turn (with a small delay for dramatic effect)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTurnMessage("对手正在行动...");

        const playerUpdates = playerResponse.gameStateUpdate || { approval: 0, funding: 0, scandalRisk: 0 };
        const tempApprovalChange = playerUpdates.approval;
        
        const stateAfterPlayerTurn: GameState = {
            ...gameState,
            approval: Math.max(0, Math.min(100, gameState.approval + tempApprovalChange)),
            opponentApproval: Math.max(0, Math.min(100, gameState.opponentApproval - tempApprovalChange)),
            funding: Math.max(0, Math.min(100, gameState.funding + playerUpdates.funding)),
            scandalRisk: Math.max(0, Math.min(100, gameState.scandalRisk + playerUpdates.scandalRisk)),
            progress: Math.min(100, gameState.progress + 3 + Math.floor(Math.random() * 3)),
        };
        const combinedLog = [...eventLog, playerResponse.narrative, playerResponse.opponentNarrative].filter(Boolean);

        const opponentResponse = await processTurn(playerProfile, combinedLog, stateAfterPlayerTurn, 'opponent');
        processApiResponse(opponentResponse, 'opponent');

        setIsLoading(false);

    }, [processApiResponse, playerProfile, eventLog, gameState]);

    useEffect(() => {
        setIsLoading(true);
        startGame(playerProfile).then(response => {
            processApiResponse(response, 'start');
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

     useEffect(() => {
        if (eventLogRef.current) {
            eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
        }
    }, [eventLog, imageUrl, isImageLoading]);

    useEffect(() => {
        if (isAutoPlay && !currentEvent && !isLoading) {
            autoPlayTimeoutRef.current = window.setTimeout(() => {
                handleChoice({ text: "继续", outcomeHint: "推进时间" });
            }, 2000); // 2 second delay for autoplay
        }
        return () => {
            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
            }
        };
    }, [isAutoPlay, currentEvent, isLoading, handleChoice]);
    
    const statsData = [
        { subject: '吸引力', value: playerProfile.stats.appealing, fullMark: MAX_STAT_POINTS },
        { subject: '政策能力', value: playerProfile.stats.policySkill, fullMark: MAX_STAT_POINTS },
        { subject: '组织能力', value: playerProfile.stats.organization, fullMark: MAX_STAT_POINTS },
        { subject: '诚信', value: playerProfile.stats.integrity, fullMark: MAX_STAT_POINTS },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto p-4 animate-fadeIn">
            {/* Timeline */}
            <div className="mb-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${gameState.progress}%` }}></div>
                </div>
                <div className="flex justify-between w-full text-xs text-gray-400 mt-1 px-1">
                    <span>报名</span>
                    <span>初选</span>
                    <span>党代会</span>
                    <span>辩论</span>
                    <span>选举日</span>
                </div>
            </div>

            {/* Main Dashboard */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg mb-4">
                <div className="grid grid-cols-12 gap-4" style={{ height: '14rem' }}>
                    
                    {/* Column 1: Labels */}
                    <div className="col-span-12 md:col-span-3 flex flex-col justify-around text-center md:text-right pr-4 md:border-r md:border-gray-700">
                        <div>
                            <h3 className="font-bold text-xl text-gray-200">支持率</h3>
                            <p className="text-xs text-gray-400">Approval Rating</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-200">竞选资金</h3>
                            <p className="text-xs text-gray-400">Campaign Funds</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-200">丑闻风险</h3>
                            <p className="text-xs text-gray-400">Scandal Risk</p>
                        </div>
                    </div>

                    {/* Column 2: Bars */}
                    <div className="col-span-12 md:col-span-5 flex flex-col justify-around relative pl-4 md:pl-0">
                        <h2 className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gray-800 px-3 text-lg font-bold">竞选状态</h2>
                        <div className="space-y-2">
                            <ProgressBar value={gameState.approval} color="bg-blue-500" label="我方" />
                            <ProgressBar value={gameState.opponentApproval} color="bg-red-600" label="对手" />
                        </div>
                        <div className="space-y-2">
                            <ProgressBar value={gameState.funding} color="bg-green-500" label="我方" />
                            <ProgressBar value={gameState.opponentFunding} color="bg-amber-500" label="对手" />
                        </div>
                        <div className="space-y-2">
                            <ProgressBar value={gameState.scandalRisk} color="bg-rose-600" label="风险" />
                        </div>
                    </div>

                    {/* Column 3: Rival Info */}
                    <div className="col-span-12 md:col-span-4 flex flex-col pl-4 md:border-l md:border-gray-700 h-full mt-4 md:mt-0">
                         <h2 className="text-lg font-bold text-white mb-2 text-center">候选人对决</h2>
                         <div className="flex-grow grid grid-cols-2 gap-2 items-center">
                            <div className="h-full flex flex-col">
                                <h3 className="text-center font-semibold text-blue-300 truncate text-sm">{playerProfile.name}</h3>
                                <div className="flex-grow">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={statsData}>
                                            <PolarGrid stroke="#4a5568" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a0aec0', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                            <Radar name={playerProfile.name} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '0.5rem' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="h-full flex flex-col justify-center text-center">
                                {gameState.opponentProfile ? (
                                    <>
                                        <h3 className="font-semibold text-red-400 truncate text-sm">{gameState.opponentProfile.name}</h3>
                                        <div className="mt-2 text-left bg-gray-700/50 p-2 rounded-lg text-xs">
                                        <p className="text-gray-300"><span className="font-semibold">党派:</span> {gameState.opponentProfile.party}</p>
                                        <p className="text-gray-300 mt-1"><span className="font-semibold">风格:</span> {gameState.opponentProfile.style}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500">正在获取对手信息...</p>
                                )}
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl shadow-lg h-[30rem] flex flex-col">
                    <h2 className="text-xl font-bold mb-2 border-b border-gray-600 pb-2 text-white">事件日志</h2>
                    <div ref={eventLogRef} className="flex-grow overflow-y-auto pr-2 space-y-3">
                        {isImageLoading && (
                            <div className="bg-gray-700/50 p-3 rounded-lg shadow flex items-center justify-center h-48">
                                <p className="text-gray-500">正在生成图片...</p>
                            </div>
                        )}
                        {imageUrl && !isImageLoading && (
                            <div className="bg-gray-700/50 p-2 rounded-lg shadow animate-fadeIn">
                                <img src={imageUrl} alt="当前事件" className="rounded-lg w-full object-cover" />
                            </div>
                        )}
                        {eventLog.map((log, index) => (
                            <div key={index} className="bg-gray-700/80 p-3 rounded-lg shadow animate-fadeIn">
                                <p className="text-sm text-gray-200 whitespace-pre-wrap">{log}</p>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                                 <p className="ml-4 text-gray-400">{turnMessage}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-xl shadow-lg h-[30rem] flex flex-col">
                    <h2 className="text-xl font-bold mb-2 border-b border-gray-600 pb-2 text-white">你的行动</h2>
                    <div className="flex-grow overflow-y-auto pr-2 flex flex-col justify-center">
                        {isLoading ? (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                                <p className="text-gray-400">{turnMessage}</p>
                            </div>
                        ) : currentEvent ? (
                            <div>
                                <h3 className="text-lg font-semibold text-blue-300 mb-2">{currentEvent.title}</h3>
                                <p className="text-gray-300 mb-4">{currentEvent.description}</p>
                                <div className="space-y-2">
                                    {currentEvent.choices.map((choice, index) => (
                                        <button key={index} onClick={() => handleChoice(choice)} className="w-full text-left bg-gray-700 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
                                            <p>{choice.text}</p>
                                            <p className="text-xs text-gray-400 italic mt-1">{choice.outcomeHint}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-semibold text-center text-blue-300 mb-2">竞选总部</h3>
                                <p className="text-gray-400 mb-4 text-center text-sm">选择你的下一个行动来推进竞选。</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <CampaignActionButton
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75v3.75m-3.75-3.75v3.75m-3.75-3.75v3.75m9-15.75a3 3 0 0 1 3-3h.008v.008h-.008a3 3 0 0 1-3-3Zm-1.5 6a3 3 0 0 0-3 3h.008v.008h-.008a3 3 0 0 0 3-3Zm1.5-1.5a3 3 0 0 1 3-3h.008v.008h-.008a3 3 0 0 1-3-3Z" /></svg>}
                                        title="进行广告宣传"
                                        description="通过媒体宣传提升公众形象。"
                                        cost={15}
                                        disabled={gameState.funding < 15}
                                        onClick={() => handleChoice({ text: "进行广告宣传", outcomeHint: "花费资金来提升支持率。" })}
                                    />
                                    <CampaignActionButton
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>}
                                        title="举办集会"
                                        description="激励你的支持者，但有失言风险。"
                                        cost={10}
                                        disabled={gameState.funding < 10}
                                        onClick={() => handleChoice({ text: "举办集会", outcomeHint: "激励支持者，但有失言风险。" })}
                                    />
                                    <CampaignActionButton
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25-2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m15-3a3 3 0 1 1-6 0m6 0a3 3 0 1 1-6 0" /></svg>}
                                        title="进行筹款"
                                        description="将这个回合用于筹集更多资金。"
                                        cost={0}
                                        disabled={false}
                                        onClick={() => handleChoice({ text: "进行筹款", outcomeHint: "将这个回合用于筹集更多资金。" })}
                                    />
                                    <CampaignActionButton
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>}
                                        title="继续竞选"
                                        description="推进时间，静观其变。"
                                        cost={0}
                                        disabled={false}
                                        onClick={() => handleChoice({ text: "继续", outcomeHint: "推进时间" })}
                                    />
                                </div>
                                <div className="mt-4 text-center">
                                    <button onClick={() => setIsAutoPlay(prev => !prev)} className={`py-2 px-6 rounded-lg font-bold text-sm ${isAutoPlay ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'} text-white`}>
                                        {isAutoPlay ? '停止自动播放' : '自动播放'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamePlay;