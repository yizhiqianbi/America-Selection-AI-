
import { useCallback } from 'react';

// Using a module-level singleton approach for audio components
let audioContext: AudioContext | null = null;
let isPlaying = false;
let noteTimeout: number | null = null;

// Notes for a tense, political thriller vibe (C minor scale)
const notes = [
    130.81, // C3
    155.56, // D#3
    196.00, // G3
    261.63, // C4
    196.00, // G3
    155.56  // D#3
];
let noteIndex = 0;

const scheduleNote = (arp: OscillatorNode, arpGain: GainNode) => {
    if (!audioContext) return;
    
    const freq = notes[noteIndex % notes.length];
    const now = audioContext.currentTime;

    // Schedule the note
    arp.frequency.setValueAtTime(freq, now);
    
    // Envelope for the note
    arpGain.gain.cancelScheduledValues(now);
    arpGain.gain.setValueAtTime(0, now);
    arpGain.gain.linearRampToValueAtTime(0.25, now + 0.05); // Attack
    arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // Decay

    noteIndex++;
    
    noteTimeout = window.setTimeout(() => scheduleNote(arp, arpGain), 500);
}


const startAudio = () => {
    if (isPlaying || typeof window === 'undefined') return;

    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            return;
        }
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // --- Master Gain ---
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.connect(audioContext.destination);

    // --- Drone ---
    const drone = audioContext.createOscillator();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(65.41, audioContext.currentTime); // Low C2
    
    const droneFilter = audioContext.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(200, audioContext.currentTime);
    
    const droneGain = audioContext.createGain();
    droneGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    
    drone.connect(droneFilter).connect(droneGain).connect(masterGain);

    // --- Arpeggio ---
    const arp = audioContext.createOscillator();
    arp.type = 'sine';
    const arpGain = audioContext.createGain();
    arp.connect(arpGain).connect(masterGain);

    // Start everything
    drone.start();
    arp.start();

    // Begin the sequence
    scheduleNote(arp, arpGain);

    // Fade in master volume
    masterGain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 5);

    isPlaying = true;
};

/**
 * Hook to manage background music for the application.
 * It ensures that the audio context is initialized only once and
 * starts playing music upon the first user interaction.
 */
export const useBackgroundMusic = () => {
    const startMusic = useCallback(() => {
        startAudio();
    }, []);

    return { startMusic };
};
