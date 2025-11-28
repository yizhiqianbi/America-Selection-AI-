
import React from 'react';
import { LocalProblem, LocalProblemChoice, Language } from '../types';

interface LocalProblemModalProps {
    problem: LocalProblem;
    onChoice: (choice: LocalProblemChoice) => void;
    onClose: () => void;
    language: Language;
}

const LocalProblemModal: React.FC<LocalProblemModalProps> = ({ problem, onChoice, onClose, language }) => {
    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="w-full max-w-2xl bg-slate-900/90 border border-amber-500/30 rounded-2xl shadow-2xl p-8 text-center animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Local Dossier: {problem.stateAbbr}</div>
                <h2 className="text-3xl font-black text-white mb-4">{problem.title[language]}</h2>
                <p className="text-gray-300 mb-6 leading-relaxed text-base">{problem.description[language]}</p>
                
                <div className="flex flex-col gap-4 mb-6">
                    {problem.choices.map((choice, idx) => (
                        <button
                            key={idx}
                            onClick={() => onChoice(choice)}
                            className="w-full text-left p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-amber-600/50 hover:border-amber-400 hover:text-white transition-all group"
                        >
                            <div className="font-bold text-lg text-gray-200 group-hover:text-white">{choice.text[language]}</div>
                            <div className="text-xs text-gray-500 mt-1 italic group-hover:text-amber-200">{choice.outcomeHint[language]}</div>
                        </button>
                    ))}
                </div>
                
                {problem.rewardHint && (
                     <div className="text-xs text-gray-500 p-2 mt-4 border-t border-white/10">
                        <span className="font-bold text-amber-400">Strategic Reward:</span> {problem.rewardHint[language]}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocalProblemModal;
