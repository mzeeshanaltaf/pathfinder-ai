'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { KeyboardControls, PerformanceMonitor, Sky, Stats, useProgress as useAssetProgress } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import type { DirectionalLight } from 'three';
import MiniGameHost from '@/components/minigames/MiniGameHost';
import MobileControls from '@/components/player/MobileControls';
import Player from '@/components/player/Player';
import { clearInput, KEYBOARD_MAP } from '@/components/player/useInput';
import Certificate from '@/components/ui/Certificate';
import CinematicOverlay from '@/components/ui/CinematicOverlay';
import Compass from '@/components/ui/Compass';
import DebugHud, { renderStats } from '@/components/ui/DebugHud';
import FadeOverlay from '@/components/ui/FadeOverlay';
import FinaleOverlay from '@/components/ui/FinaleOverlay';
import GemToast from '@/components/ui/GemToast';
import HUD from '@/components/ui/HUD';
import InteractPrompt from '@/components/ui/InteractPrompt';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Minimap from '@/components/ui/Minimap';
import NoticeToast from '@/components/ui/NoticeToast';
import Onboarding from '@/components/ui/Onboarding';
import Passport from '@/components/ui/Passport';
import PhasePanel from '@/components/ui/PhasePanel';
import SessionManager from '@/components/ui/SessionManager';
import Settings from '@/components/ui/Settings';
import StartOverlay from '@/components/ui/StartOverlay';
import TutorialTracker from '@/components/ui/TutorialTracker';
import WelcomeBack from '@/components/ui/WelcomeBack';
import BalloonTravel from '@/components/world/BalloonTravel';
import Finale from '@/components/world/Finale';
import World from '@/components/world/World';
import { hasQueryFlag, isCoarsePointer } from '@/lib/device';
import { COLORS } from '@/lib/palette';
import { useProgress } from '@/store/progress';
import { useUi, type PerfTier } from '@/store/ui';

const MAX_DPR = 1.75;
/** Direction to the sun (shared by the sky shader and the shadow-casting light). */
const SUN_DIR: [number, number, number] = [0.45, 0.8, 0.4];
const SHADOW_EXTENT = 40;

/** The single shadow-casting light. It follows the camera so shadows stay crisp in a large world. */
function SunLight({ shadows }: { shadows: boolean }) {
  const light = useRef<DirectionalLight>(null);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const target = light.current?.target;
    if (!target) return;
    scene.add(target);
    return () => {
      scene.remove(target);
    };
  }, [scene]);

  useFrame(({ camera }) => {
    const l = light.current;
    if (!l) return;
    const { x, y, z } = camera.position;
    l.position.set(x + SUN_DIR[0] * 80, y + SUN_DIR[1] * 80, z + SUN_DIR[2] * 80);
    l.target.position.set(x, y, z);
    l.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={light}
      castShadow={shadows}
      intensity={2.4}
      color={COLORS.sun}
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.04}
      shadow-camera-left={-SHADOW_EXTENT}
      shadow-camera-right={SHADOW_EXTENT}
      shadow-camera-top={SHADOW_EXTENT}
      shadow-camera-bottom={-SHADOW_EXTENT}
      shadow-camera-near={1}
      shadow-camera-far={200}
    />
  );
}

/** Flags the world as ready once Physics (rapier WASM) and the world have mounted. */
function WorldReady() {
  useEffect(() => {
    useUi.getState().setWorldReady(true);
    return () => useUi.getState().setWorldReady(false);
  }, []);
  return null;
}

/** `?debug`: copy last frame's renderer.info (draw calls etc.) for the debug HUD. */
function RenderProbe() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__aiQuestScene = scene;
  }, [scene]);
  useFrame(() => {
    const { render, memory, programs } = gl.info;
    renderStats.calls = render.calls;
    renderStats.triangles = render.triangles;
    renderStats.geometries = memory.geometries;
    renderStats.textures = memory.textures;
    renderStats.programs = programs?.length ?? 0;
  });
  return null;
}

/** World-load progress: asset loads tracked by three's loading manager, then physics + world mount. */
function Loading() {
  const worldReady = useUi((s) => s.worldReady);
  const { progress, total } = useAssetProgress();
  const assets = total > 0 ? progress : 0;
  const pct = worldReady ? 100 : 18 + assets * 0.7;
  const stage = worldReady ? 'Ready!' : assets < 100 && total > 0 ? 'Painting the sky…' : 'Waking the physics engine…';
  return <LoadingScreen fading={worldReady} progress={pct} stage={stage} />;
}

/** Effective rendering tier: the Settings choice, or the auto tier from PerformanceMonitor. */
function useTier(): PerfTier {
  const quality = useProgress((s) => s.settings.quality);
  const auto = useUi((s) => s.perfTier);
  return quality === 'high' ? 2 : quality === 'low' ? 0 : auto;
}

export default function Game() {
  const [touch] = useState(isCoarsePointer);
  const [debug] = useState(() => hasQueryFlag('debug'));
  const [physicsDebug] = useState(() => hasQueryFlag('physics'));
  const tier = useTier();
  const dpr = tier === 2 ? Math.min(window.devicePixelRatio || 1, MAX_DPR) : 1;

  // Phones start one tier down (dpr 1): high-DPR screens cost a lot of fill rate.
  useEffect(() => {
    if (touch) useUi.getState().setPerfTier(1);
  }, [touch]);

  // Track pointer lock (desktop). Esc releases it natively and the start overlay reappears.
  useEffect(() => {
    const onChange = () => {
      const locked = !!document.pointerLockElement;
      useUi.getState().setPointerLocked(locked);
      clearInput();
    };
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  const step = (d: -1 | 1) => {
    const ui = useUi.getState();
    // Climbing back stops at medium: re-enabling shadows recompiles every material (a visible hitch).
    const next = Math.max(0, Math.min(d > 0 && ui.perfTier === 0 ? 0 : 2, ui.perfTier + d)) as PerfTier;
    if (next !== ui.perfTier) ui.setPerfTier(next);
  };

  return (
    <div id="game" className="fixed inset-0 touch-none overflow-hidden select-none">
      <KeyboardControls map={KEYBOARD_MAP}>
        <Canvas shadows="percentage" dpr={dpr} camera={{ fov: 70, near: 0.1, far: 2500 }} gl={{ powerPreference: 'high-performance' }}>
          <PerformanceMonitor flipflops={4} onDecline={() => step(-1)} onIncline={() => step(1)} onFallback={() => useUi.getState().setPerfTier(0)} />
          <color attach="background" args={[COLORS.fog]} />
          <fog attach="fog" args={[COLORS.fog, 70, 430]} />
          <Sky
            distance={1000}
            sunPosition={SUN_DIR}
            turbidity={5}
            rayleigh={0.55}
            mieCoefficient={0.004}
            mieDirectionalG={0.85}
          />
          <hemisphereLight args={[COLORS.hemiSky, COLORS.hemiGround, 1.3]} />
          <SunLight shadows={tier > 0} />

          <Suspense fallback={null}>
            <Physics timeStep="vary" debug={physicsDebug}>
              <World />
              <Player />
              <WorldReady />
            </Physics>
          </Suspense>
          <BalloonTravel />
          <Finale />

          {debug && <Stats />}
          {debug && <RenderProbe />}
        </Canvas>
      </KeyboardControls>

      <SessionManager />
      {touch ? <MobileControls /> : <StartOverlay />}
      <Minimap />
      <HUD />
      <Compass />
      <InteractPrompt />
      <GemToast />
      <NoticeToast />
      <TutorialTracker />
      <CinematicOverlay />
      <PhasePanel />
      <Passport />
      <MiniGameHost />
      <Onboarding />
      <WelcomeBack />
      <Settings />
      <FinaleOverlay />
      <Certificate />
      <FadeOverlay />
      <Loading />
      {debug && <DebugHud />}
    </div>
  );
}
