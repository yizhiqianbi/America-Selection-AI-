import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center, Stars } from '@react-three/drei';
import { 
    Vector3, Group, Mesh, MeshStandardMaterial, Shape, ExtrudeGeometry, 
    PerspectiveCamera, Box3, MathUtils, Color
} from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ElectoralMap, Party, StateAffiliation, LocalProblem, GameState, StateBuff, Language } from '../types';
import { STATE_NAME_TO_ABBR, ELECTORAL_VOTES, UI_TEXT, STATE_ABBR_TO_NAME } from '../constants';
import { useMapSounds } from '../hooks/useAudio';

// Fix for missing JSX Intrinsic Elements definitions in the current environment
// Augmenting both global and module-level JSX to ensure compatibility
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      pointLight: any;
      octahedronGeometry: any;
      meshStandardMaterial: any;
      torusGeometry: any;
      extrudeGeometry: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      color: any;
      fog: any;
      ambientLight: any;
      directionalLight: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      pointLight: any;
      octahedronGeometry: any;
      meshStandardMaterial: any;
      torusGeometry: any;
      extrudeGeometry: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      color: any;
      fog: any;
      ambientLight: any;
      directionalLight: any;
    }
  }
}

// --- Components ---

const StateTooltip: React.FC<{
    hoverInfo: {
        name: string;
        votes: number;
        affiliation: StateAffiliation;
        playerParty: Party;
        opponentParty: Party;
        activeBuff: StateBuff | null;
        x: number;
        y: number;
    } | null;
    language: Language;
}> = ({ hoverInfo, language }) => {
    if (!hoverInfo) return null;

    const { name, votes, affiliation, playerParty, opponentParty, activeBuff, x, y } = hoverInfo;

    const affiliationInfo = useMemo(() => {
        switch (affiliation) {
            case StateAffiliation.Player:
                return { label: 'CONTROLLED', color: playerParty === Party.Democrat ? 'text-blue-400' : 'text-red-400' };
            case StateAffiliation.Opponent:
                return { label: 'OPPONENT CONTROL', color: opponentParty === Party.Democrat ? 'text-blue-400' : 'text-red-400' };
            case StateAffiliation.Swing:
                return { label: 'BATTLEGROUND', color: 'text-amber-400' };
            default:
                return { label: 'UNKNOWN', color: 'text-gray-400' };
        }
    }, [affiliation, playerParty, opponentParty]);

    return (
        <div
            className="absolute z-20 p-3 rounded-lg glass-panel text-white transition-opacity duration-200 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 animate-fadeIn"
            style={{ left: x, top: y, opacity: hoverInfo ? 1 : 0 }}
        >
            <h4 className="font-black text-base text-white whitespace-nowrap">{name}</h4>
            <div className="text-xs text-gray-300 whitespace-nowrap">Electoral Votes: <span className="font-bold text-white">{votes}</span></div>
            <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${affiliationInfo.color}`}>
                {affiliationInfo.label}
            </div>
            {activeBuff && (
                 <div className="mt-2 pt-2 border-t border-white/10 text-xs text-cyan-300">
                    <div className="font-bold">Focus: {activeBuff.name[language]}</div>
                    <div>Turns Left: {activeBuff.turnsRemaining}</div>
                </div>
            )}
        </div>
    );
};


const ElectoralVoteDisplay: React.FC<{ playerVotes: number; opponentVotes: number; swingVotes: number; playerParty: Party; opponentParty: Party; }> = ({ playerVotes, opponentVotes, swingVotes, playerParty, opponentParty }) => {
    const totalVotes = 538;
    const playerPercent = (playerVotes / totalVotes) * 100;
    const opponentPercent = (opponentVotes / totalVotes) * 100;
    const winPercent = (270 / totalVotes) * 100;

    const playerColorClass = playerParty === Party.Democrat ? 'bg-blue-600' : 'bg-red-600';
    const opponentColorClass = opponentParty === Party.Democrat ? 'bg-blue-600' : 'bg-red-600';

    return (
        <div className="absolute top-4 left-4 z-10 w-full max-w-xs p-4 rounded-xl glass-panel animate-fadeIn pointer-events-none select-none">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3">Electoral Votes (270 to Win)</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className={`flex items-center gap-2 font-bold ${playerParty === Party.Democrat ? 'text-blue-400' : 'text-red-400'}`}>
                        <span className={`w-3 h-3 rounded-full ${playerColorClass}`}></span>
                        {UI_TEXT.en.mapPlayer}
                    </span>
                    <span className="font-mono font-black text-lg text-white">{playerVotes}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className={`flex items-center gap-2 font-bold ${opponentParty === Party.Democrat ? 'text-blue-400' : 'text-red-400'}`}>
                         <span className={`w-3 h-3 rounded-full ${opponentColorClass}`}></span>
                        {UI_TEXT.en.mapOpponent}
                    </span>
                    <span className="font-mono font-black text-lg text-white">{opponentVotes}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 font-bold text-amber-400">
                         <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        {UI_TEXT.en.mapSwing}
                    </span>
                    <span className="font-mono font-black text-lg text-white">{swingVotes}</span>
                </div>
            </div>
            <div className="relative w-full h-3 bg-slate-700/50 rounded-full mt-4 overflow-hidden border border-slate-600/50">
                <div className={`absolute h-full ${playerColorClass}`} style={{ width: `${playerPercent}%` }}></div>
                <div className={`absolute h-full ${opponentColorClass}`} style={{ left: `${100 - opponentPercent}%`, width: `${opponentPercent}%` }}></div>
                <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/80" style={{ left: `${winPercent}%` }}></div>
            </div>
        </div>
    );
};

// --- 3D Components & Logic ---

const ProblemIndicator: React.FC<{ position: Vector3 }> = ({ position }) => {
    const ref = useRef<Group>(null!);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        ref.current.rotation.z = t * 0.5;
        ref.current.position.z = Math.sin(t * 3) * 0.5 + 1.5; // Bob up and down
    });

    return (
        <group ref={ref} position={position}>
            <pointLight color="#f59e0b" intensity={5} distance={5} />
            <mesh>
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial 
                    color="#f59e0b" 
                    emissive="#f59e0b" 
                    emissiveIntensity={2} 
                    toneMapped={false}
                    transparent
                    opacity={0.7}
                />
            </mesh>
        </group>
    );
};

const StateFocusRing: React.FC<{ position: Vector3; size: number; isHovered: boolean; }> = ({ position, size, isHovered }) => {
    const ref = useRef<Mesh>(null!);
    const materialRef = useRef<MeshStandardMaterial>(null!);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        ref.current.rotation.z = -t * 0.3;

        // Pulse more intensely when hovered
        const pulseSpeed = isHovered ? 12 : 4;
        const pulseAmplitude = isHovered ? 0.6 : 0.4;
        const baseIntensity = isHovered ? 2.5 : 2;

        const pulse = Math.sin(t * pulseSpeed) * pulseAmplitude + 1.0;
        if (materialRef.current) {
            // Use lerp for smooth transitions
            materialRef.current.emissiveIntensity = MathUtils.lerp(materialRef.current.emissiveIntensity, baseIntensity * pulse, 0.1);
        }
    });

    return (
        <mesh ref={ref} position={position} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[size, 0.1, 2, 64]} />
            <meshStandardMaterial
                ref={materialRef}
                color="#22d3ee"
                emissive="#22d3ee"
                emissiveIntensity={2} // Initial base intensity
                toneMapped={false}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
};


// This component handles the smooth camera animation
const CameraAnimator: React.FC<{
    target: { position: Vector3, lookAt: Vector3 } | null;
    setTarget: (target: any) => void;
    controlsRef: React.RefObject<OrbitControlsImpl>;
}> = ({ target, setTarget, controlsRef }) => {
    useFrame((state, delta) => {
        if (target && controlsRef.current) {
            const speed = delta * 3; // Animation speed
            state.camera.position.lerp(target.position, speed);
            controlsRef.current.target.lerp(target.lookAt, speed);
            controlsRef.current.update();

            // Stop animating when close enough to prevent unnecessary re-renders
            if (state.camera.position.distanceTo(target.position) < 0.1) {
                setTarget(null);
            }
        }
    });
    return null;
}


// Palette
const COLORS = {
    DEM: new Color('#2563eb'), 
    REP: new Color('#dc2626'),
    SWING: new Color('#d97706'),
    UNDECIDED: new Color('#334155'),
    STROKE: new Color('#94a3b8'),
    HOVER: new Color('#22d3ee') 
};

const GEOJSON_URL = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

// Improved Projection (Pseudo-Albers approximation for USA)
const MAP_SCALE = 1.2;
const CENTER_LONG = -96;
const CENTER_LAT = 37.5;

const project = (lon: number, lat: number, stateName: string): [number, number] => {
    let x = (lon - CENTER_LONG) * MAP_SCALE * 0.8;
    let y = (lat - CENTER_LAT) * MAP_SCALE;

    // Insets to bring Alaska and Hawaii closer to mainland for better centering
    if (stateName === 'Alaska') {
        x = (x * 0.35) - 22;
        y = (y * 0.35) - 16;
    } else if (stateName === 'Hawaii') {
        const hawaiiScale = 1.8; 
        const hawaiiXOffset = -26;
        const hawaiiYOffset = -18;
        x = (lon + 157) * hawaiiScale + hawaiiXOffset;
        y = (lat - 20.5) * hawaiiScale + hawaiiYOffset;
    }

    return [x, y];
};

const createShapesFromFeature = (feature: any) => {
    const shapes: Shape[] = [];
    const stateName = feature.properties.name;

    if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach((polygon: number[][]) => {
            const shape = new Shape();
            polygon.forEach((coord, i) => {
                const [x, y] = project(coord[0], coord[1], stateName);
                if (i === 0) shape.moveTo(x, y);
                else shape.lineTo(x, y);
            });
            shapes.push(shape);
        });
    } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach((multiPoly: number[][][]) => {
            multiPoly.forEach((polygon) => {
                const shape = new Shape();
                polygon.forEach((coord, i) => {
                    const [x, y] = project(coord[0], coord[1], stateName);
                    if (i === 0) shape.moveTo(x, y);
                    else shape.lineTo(x, y);
                });
                shapes.push(shape);
            });
        });
    }
    return shapes;
};

const StateMesh: React.FC<{
    feature: any;
    affiliation: StateAffiliation;
    playerParty: Party;
    opponentParty: Party;
    onClick: (feature: any) => void;
    onPointerOver: (e: any) => void;
    onPointerOut: (e: any) => void;
    playFlip: () => void;
}> = ({ feature, affiliation, playerParty, opponentParty, onClick, onPointerOver, onPointerOut, playFlip }) => {
    const mesh = useRef<Mesh>(null!);
    const [hovered, setHover] = useState(false);
    const { clock } = useThree();
    
    // For affiliation change animation
    const prevAffiliation = useRef(affiliation);
    const animation = useRef({ active: false, startTime: 0 });

    useEffect(() => {
        if (prevAffiliation.current !== affiliation) {
            animation.current = { active: true, startTime: clock.getElapsedTime() };
            playFlip();
        }
        prevAffiliation.current = affiliation;
    }, [affiliation, playFlip, clock]);

    const shapes = useMemo(() => createShapesFromFeature(feature), [feature]);
    
    const baseColor = useMemo(() => {
        switch (affiliation) {
            case StateAffiliation.Player:
                return playerParty === Party.Democrat ? COLORS.DEM : COLORS.REP;
            case StateAffiliation.Opponent:
                return opponentParty === Party.Democrat ? COLORS.DEM : COLORS.REP;
            case StateAffiliation.Swing:
                return COLORS.SWING;
            default:
                return COLORS.UNDECIDED; // Fallback color
        }
    }, [affiliation, playerParty, opponentParty]);

    // Smooth color transition and swing state pulse
    useFrame((state, delta) => {
        if (mesh.current) {
             const targetColor = hovered ? COLORS.HOVER : baseColor;
             (mesh.current.material as MeshStandardMaterial).color.lerp(targetColor, delta * 10);

             // Pulse effect for swing states
             if (affiliation === StateAffiliation.Swing && !hovered) {
                 const time = state.clock.elapsedTime;
                 const pulse = (Math.sin(time * 2) + 1) * 0.1 + 0.3; // oscillates
                 (mesh.current.material as MeshStandardMaterial).emissiveIntensity = pulse;
             } else {
                 // Reset intensity for non-swing states or when hovered
                 (mesh.current.material as MeshStandardMaterial).emissiveIntensity = 0.2;
             }

             // Affiliation change pulse animation
            if (animation.current.active) {
                const elapsedTime = state.clock.elapsedTime - animation.current.startTime;
                const duration = 0.6; 

                if (elapsedTime < duration) {
                    const pulse = Math.sin((elapsedTime / duration) * Math.PI) * 0.15; 
                    mesh.current.scale.set(1 + pulse, 1 + pulse, 1);
                } else {
                    animation.current.active = false;
                    mesh.current.scale.set(1, 1, 1); 
                }
            }
        }
    });

    const extrudeSettings = useMemo(() => ({
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
    }), []);

    return (
        <group>
             <mesh
                ref={mesh}
                position={[0, 0, 0]}
                onClick={(e) => { e.stopPropagation(); onClick(feature); }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHover(true);
                    document.body.style.cursor = 'pointer';
                    onPointerOver(e);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setHover(false);
                    document.body.style.cursor = 'auto';
                    onPointerOut(e);
                }}
             >
                <extrudeGeometry args={[shapes, extrudeSettings]} />
                <meshStandardMaterial 
                    color={baseColor}
                    roughness={1}
                    metalness={0}
                    emissive={baseColor}
                    emissiveIntensity={0.2}
                />
            </mesh>
            {/* Edge Highlight */}
            <lineSegments position={[0,0,0.51]}>
                <edgesGeometry args={[new ExtrudeGeometry(shapes, { depth: 0, bevelEnabled: false })]} />
                <lineBasicMaterial color={COLORS.STROKE} opacity={0.3} transparent />
            </lineSegments>
        </group>
    );
};

interface ElectionMapProps {
    mapData: ElectoralMap;
    playerParty: Party;
    opponentParty: Party;
    localProblems: LocalProblem[];
    stateFocus: GameState['stateFocus'];
    onStateSelect: (abbr: string) => void;
    language: Language;
    forceZoomOut?: number; // New prop to trigger zoom out externally
    activeEventStateAbbr?: string | null;
}

const ElectionMap: React.FC<ElectionMapProps> = ({ mapData, playerParty, opponentParty, localProblems, stateFocus, onStateSelect, language, forceZoomOut, activeEventStateAbbr }) => {
    const [geoData, setGeoData] = useState<any>(null);
    const [hoverInfo, setHoverInfo] = useState<{ name: string; votes: number; affiliation: StateAffiliation; activeBuff: StateBuff | null; x: number; y: number; } | null>(null);
    const { playClick, playHover, panZoomSound, playFlip } = useMapSounds();
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const lastHoveredState = useRef<string | null>(null);
    const [target, setTarget] = useState<{ position: Vector3, lookAt: Vector3 } | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [stateMetrics, setStateMetrics] = useState<{ [key: string]: { center: Vector3, size: number } }>({});
    const t = UI_TEXT[language];

    useEffect(() => {
        fetch(GEOJSON_URL)
            .then(res => res.json())
            .then(data => {
                setGeoData(data);
                const metrics: { [key: string]: { center: Vector3, size: number } } = {};
                data.features.forEach((feature: any) => {
                    const stateAbbr = STATE_NAME_TO_ABBR[feature.properties.name];
                    if (stateAbbr) {
                        const bbox = new Box3();
                        const shapes = createShapesFromFeature(feature);
                        shapes.forEach(shape => {
                            const points = shape.getPoints();
                            points.forEach(p => bbox.expandByPoint(new Vector3(p.x, p.y, 0)));
                        });
                        const center = new Vector3();
                        bbox.getCenter(center);
                        const sizeVec = new Vector3();
                        bbox.getSize(sizeVec);
                        const size = Math.max(sizeVec.x, sizeVec.y);
                        metrics[stateAbbr] = { center, size };
                    }
                });
                setStateMetrics(metrics);
            })
            .catch(err => console.error("Failed to load map data", err));
    }, []);

    useEffect(() => {
        const controls = controlsRef.current;
        if (controls) {
            controls.maxPolarAngle = Math.PI / 2.5;
            controls.minPolarAngle = 0.5;
            controls.minDistance = 10;
            controls.maxDistance = 200; // Increased to allow seeing full map
            controls.enablePan = false; // Disable panning to keep map centered

            const startListener = () => { if (!target) panZoomSound.start(); };
            const endListener = () => panZoomSound.stop();
            controls.addEventListener('start', startListener);
            controls.addEventListener('end', endListener);
            return () => {
                controls.removeEventListener('start', startListener);
                controls.removeEventListener('end', endListener);
            };
        }
    }, [panZoomSound, target]);

    const voteCounts = useMemo(() => {
        let player = 0, opponent = 0, swing = 0;
        Object.entries(ELECTORAL_VOTES).forEach(([abbr, votes]) => {
             const aff = mapData[abbr] || StateAffiliation.Swing;
             if (aff === StateAffiliation.Player) player += votes;
             else if (aff === StateAffiliation.Opponent) opponent += votes;
             else swing += votes;
        });
        return { player, opponent, swing };
    }, [mapData]);
    
    // Adjusted initial camera for full view
    const initialCameraTarget = useMemo(() => ({
        position: new Vector3(0, -5, 70), // Further back and less tilted down
        lookAt: new Vector3(0, 0, 0)
    }), []);

    const handleZoomOut = useCallback(() => {
        playClick();
        setTarget(initialCameraTarget);
        setIsZoomed(false);
    }, [playClick, initialCameraTarget]);

    // Handle external force zoom out
    useEffect(() => {
        if (forceZoomOut && forceZoomOut > 0) {
            handleZoomOut();
        }
    }, [forceZoomOut, handleZoomOut]);

    const handleStateClick = useCallback((feature: any) => {
        const stateAbbr = STATE_NAME_TO_ABBR[feature.properties.name];
        playClick();
        onStateSelect(stateAbbr);

        if (!controlsRef.current) return;
        
        const bbox = new Box3();
        const shapes = createShapesFromFeature(feature);
        shapes.forEach(shape => {
            const points = shape.getPoints();
            points.forEach(p => bbox.expandByPoint(new Vector3(p.x, p.y, 0)));
        });

        const center = new Vector3();
        bbox.getCenter(center);
        const size = new Vector3();
        bbox.getSize(size);
        
        // Calculate appropriate distance based on state size
        const camera = controlsRef.current.object as PerspectiveCamera;
        const maxDim = Math.max(size.x, size.y);
        const fitHeightDistance = maxDim / (2 * Math.tan(camera.fov * Math.PI / 360));
        const fitWidthDistance = (maxDim / camera.aspect) / (2 * Math.tan(camera.fov * Math.PI / 360));
        const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);

        // Position camera to look at the state from a good angle (similar to default view but closer)
        // We use the center of the state, then offset Z (distance) and Y (tilt)
        const cameraPosition = new Vector3(
            center.x, 
            center.y - (distance * 0.5), // Tilt back a bit
            center.z + Math.max(distance, 10)
        );

        setTarget({ position: cameraPosition, lookAt: center });
        setIsZoomed(true);
    }, [onStateSelect, playClick]);


    return (
        <div 
            className="w-full h-full relative" 
            style={{ touchAction: 'none' }}
            onWheel={(e) => e.stopPropagation()} // Stop wheel events from bubbling to EventLog/Page
        >
            <StateTooltip hoverInfo={hoverInfo ? { ...hoverInfo, playerParty, opponentParty } : null} language={language} />
            <ElectoralVoteDisplay 
                playerVotes={voteCounts.player} 
                opponentVotes={voteCounts.opponent} 
                swingVotes={voteCounts.swing}
                playerParty={playerParty}
                opponentParty={opponentParty}
            />
            
            <Canvas camera={{ position: [0, -5, 70], fov: 45 }}>
                <color attach="background" args={['#020617']} />
                {/* Relaxed fog to prevent darkening on zoom out */}
                <fog attach="fog" args={['#020617', 150, 450]} />
                
                {/* High ambient intensity for flat, bright, non-reflective look */}
                <ambientLight intensity={3.5} />
                
                {/* Subtle directional light for slight depth, but no harsh specular highlights */}
                <directionalLight position={[10, 10, 50]} intensity={0.5} color="#ffffff" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <Center>
                    <group rotation={[0, 0, 0]} onPointerMissed={() => isZoomed && handleZoomOut()}>
                        {geoData?.features?.map((feature: any) => {
                            const stateName = feature.properties.name;
                            const abbr = STATE_NAME_TO_ABBR[stateName];
                            const affiliation = mapData[abbr] || StateAffiliation.Swing;

                            return (
                                <StateMesh
                                    key={stateName}
                                    feature={feature}
                                    affiliation={affiliation}
                                    playerParty={playerParty}
                                    opponentParty={opponentParty}
                                    onClick={handleStateClick}
                                    playFlip={playFlip}
                                    onPointerOver={(e) => {
                                        e.stopPropagation();
                                        if (lastHoveredState.current !== stateName) {
                                            playHover();
                                            lastHoveredState.current = stateName;
                                        }
                                        setHoverInfo({
                                            name: stateName,
                                            votes: ELECTORAL_VOTES[abbr],
                                            affiliation,
                                            activeBuff: stateFocus[abbr] || null,
                                            x: e.clientX,
                                            y: e.clientY,
                                        });
                                    }}
                                    onPointerOut={(e) => {
                                        e.stopPropagation();
                                        setHoverInfo(null);
                                        lastHoveredState.current = null;
                                    }}
                                />
                            );
                        })}
                         {Object.entries(stateMetrics).map(([abbr, metrics]) => {
                            const problem = localProblems.find(p => p.stateAbbr === abbr && !p.resolved);
                            const focus = stateFocus[abbr];
                            const typedMetrics = metrics as { center: Vector3; size: number };
                            const isHovered = !!hoverInfo && STATE_ABBR_TO_NAME[abbr] === hoverInfo.name;

                            return (
                                <React.Fragment key={abbr}>
                                    {problem && <ProblemIndicator position={typedMetrics.center} />}
                                    {focus && <StateFocusRing 
                                                position={typedMetrics.center} 
                                                size={typedMetrics.size * 0.6}
                                                isHovered={isHovered}
                                              />}
                                </React.Fragment>
                            );
                        })}
                    </group>
                </Center>
                <OrbitControls 
                    ref={controlsRef}
                    makeDefault
                />
                <CameraAnimator target={target} setTarget={setTarget} controlsRef={controlsRef} />
            </Canvas>
        </div>
    );
};

export default ElectionMap;