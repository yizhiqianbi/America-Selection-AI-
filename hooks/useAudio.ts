import { useRef, useCallback } from 'react';

let audioContext: AudioContext | null = null;

const initializeAudioContext = () => {
    if (audioContext === null && typeof window !== 'undefined') {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
        }
    }
};

// --- Sound Generators ---

const createClickSound = () => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
};

const createHoverSound = () => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
};

const createFlipSound = () => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
};

const createLeakSound = () => {
    if (!audioContext) return;
    const time = audioContext.currentTime;
    
    // Low dramatic tone
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(100, time);
    gain1.gain.setValueAtTime(0.3, time);
    gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    
    // High-hat like tick
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1500, time + 0.2);
    gain2.gain.setValueAtTime(0.2, time + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);

    osc1.start(time);
    osc1.stop(time + 0.8);
    osc2.start(time + 0.2);
    osc2.stop(time + 0.3);
};

const createAlertSound = () => {
    if (!audioContext) return;
    const time = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.linearRampToValueAtTime(1000, time + 0.1);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.2, time + 0.01);
    gain.gain.setValueAtTime(0.2, time + 0.09);
    gain.gain.linearRampToValueAtTime(0, time + 0.1);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(time);
    osc.stop(time + 0.1);
};


// --- Whoosh Sound ---
let whooshNode: { source: AudioBufferSourceNode, gain: GainNode } | null = null;

const createWhooshSound = () => {
    if (!audioContext) return { start: () => {}, stop: () => {} };

    const start = () => {
        if (!audioContext || whooshNode) return; // Already playing

        const bufferSize = audioContext.sampleRate * 0.5; // 0.5 second buffer
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // White noise
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, audioContext.currentTime);
        filter.Q.setValueAtTime(1, audioContext.currentTime);

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, audioContext.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        source.start();
        
        // Fade in
        gain.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
        filter.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.3);

        whooshNode = { source, gain };
    };

    const stop = () => {
        if (!audioContext || !whooshNode) return;

        const { gain } = whooshNode;
        // Fade out
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);

        setTimeout(() => {
            if (whooshNode) {
                whooshNode.source.stop();
                whooshNode.source.disconnect();
                whooshNode = null;
            }
        }, 200);
    };
    
    return { start, stop };
};

// --- The Hook ---

export const useMapSounds = () => {
    // We initialize here to ensure the AudioContext can be created on first use.
    // This IIFE runs only once.
    useRef<boolean>((() => {
        initializeAudioContext();
        return true;
    })());

    const whooshSoundRef = useRef(createWhooshSound());

    const playClick = useCallback(() => {
        initializeAudioContext(); // Ensure it's ready on first interaction
        createClickSound();
    }, []);

    const playHover = useCallback(() => {
        if (!audioContext) return; // Don't initialize on hover to avoid issues.
        createHoverSound();
    }, []);
    
    const playFlip = useCallback(() => {
        initializeAudioContext();
        createFlipSound();
    }, []);

    const playLeak = useCallback(() => {
        initializeAudioContext();
        createLeakSound();
    }, []);

    const playAlert = useCallback(() => {
        initializeAudioContext();
        createAlertSound();
    }, []);

    return {
        playClick,
        playHover,
        panZoomSound: whooshSoundRef.current,
        playFlip,
        playLeak,
        playAlert
    };
};