'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { KeyboardControls, PerformanceMonitor, Sky, Stats } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import type { DirectionalLight } from 'three';
import MobileControls from '@/components/player/MobileControls';
import Player from '@/components/player/Player';
import { clearInput, KEYBOARD_MAP } from '@/components/player/useInput';
import DebugHud from '@/components/ui/DebugHud';
import FadeOverlay from '@/components/ui/FadeOverlay';
import LoadingScreen from '@/components/ui/LoadingScreen';
import StartOverlay from '@/components/ui/StartOverlay';
import World from '@/components/world/World';
import { hasQueryFlag, isCoarsePointer } from '@/lib/device';
import { COLORS } from '@/lib/palette';
import { useUi } from '@/store/ui';

const MAX_DPR = 1.75;
/** Direction to the sun (shared by the sky shader and the shadow-casting light). */
const SUN_DIR: [number, number, number] = [0.45, 0.8, 0.4];
const SHADOW_EXTENT = 40;

/** The single shadow-casting light. It follows the camera so shadows stay crisp in a large world. */
function SunLight() {
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
      castShadow
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

export default function Game() {
  const [touch] = useState(isCoarsePointer);
  const [debug] = useState(() => hasQueryFlag('debug'));
  const [physicsDebug] = useState(() => hasQueryFlag('physics'));
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, MAX_DPR));
  const worldReady = useUi((s) => s.worldReady);

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

  return (
    <div id="game" className="fixed inset-0 touch-none overflow-hidden select-none">
      <KeyboardControls map={KEYBOARD_MAP}>
        <Canvas shadows="percentage" dpr={dpr} camera={{ fov: 70, near: 0.1, far: 2500 }} gl={{ powerPreference: 'high-performance' }}>
          <PerformanceMonitor
            flipflops={3}
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr(Math.min(window.devicePixelRatio || 1, MAX_DPR))}
            onFallback={() => setDpr(1)}
          />
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
          <SunLight />

          <Suspense fallback={null}>
            <Physics timeStep="vary" debug={physicsDebug}>
              <World />
              <Player />
              <WorldReady />
            </Physics>
          </Suspense>

          {debug && <Stats />}
        </Canvas>
      </KeyboardControls>

      {touch ? <MobileControls /> : <StartOverlay />}
      <FadeOverlay />
      <LoadingScreen fading={worldReady} />
      {debug && <DebugHud />}
    </div>
  );
}
