import React, { useState, useMemo, useCallback } from 'react';
import { Talent } from '../types';
import { ALL_TALENTS, TALENTS_TO_SHOW, TALENTS_TO_PICK } from '../constants';

interface TalentSelectionProps {
    onTalentsSelected: (talents: Talent[]) => void;
}

const TalentSelection: React.FC<TalentSelectionProps> = ({ onTalentsSelected }) => {
    const [selectedTalents, setSelectedTalents] = useState<Talent[]>([]);

    const availableTalents = useMemo(() => {
        const shuffled = [...ALL_TALENTS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, TALENTS_TO_SHOW);
    }, []);

    const handleTalentClick = useCallback((talent: Talent) => {
        setSelectedTalents(prev => {
            if (prev.find(t => t.name === talent.name)) {
                return prev.filter(t => t.name !== talent.name);
            }
            if (prev.length < TALENTS_TO_PICK) {
                return [...prev, talent];
            }
            return prev;
        });
    }, []);

    const canConfirm = selectedTalents.length === TALENTS_TO_PICK;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-2xl shadow-2xl animate-fadeIn">
            <h1 className="text-3xl font-bold text-center text-white mb-2">天赋抽卡</h1>
            <p className="text-center text-gray-400 mb-6">请选择 {TALENTS_TO_PICK} 个天赋</p>

            <div className="space-y-3 mb-8">
                {availableTalents.map(talent => {
                    const isSelected = selectedTalents.some(t => t.name === talent.name);
                    return (
                        <div
                            key={talent.name}
                            onClick={() => handleTalentClick(talent)}
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                                isSelected 
                                ? 'bg-blue-900 border-blue-500' 
                                : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                            }`}
                        >
                            <h3 className="font-bold text-lg text-white">{talent.name}</h3>
                            <p className="text-sm text-gray-300">{talent.description}</p>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => onTalentsSelected(selectedTalents)}
                disabled={!canConfirm}
                className={`w-full py-3 px-6 rounded-lg font-bold text-xl text-white transition-all duration-300 ${
                    canConfirm 
                    ? 'bg-green-600 hover:bg-green-500 transform hover:scale-105' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
            >
                确认 ({selectedTalents.length}/{TALENTS_TO_PICK})
            </button>
        </div>
    );
};

export default TalentSelection;
