'use client';

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { useFrame, type RootState } from '@react-three/fiber';
import { Outlines, Text } from '@react-three/drei';
import { Color, FrontSide, Matrix4, MeshBasicMaterial, type Group, type InstancedMesh } from 'three';
import { playerPose } from '@/components/player/playerState';
import type { IslandDef } from '@/data/world';
import { mergeParts, type Part, type Vec3 } from '@/lib/landmarkKit';
import { vertexGlow, vertexToon } from '@/lib/materials';
import { COLORS } from '@/lib/palette';
import { useUi } from '@/store/ui';

export const LABEL_FONT = '/fonts/Geist-Regular.ttf';

export interface LandmarkCtx {
  def: IslandDef;
  /** Landmark base, world space. */
  position: Vec3;
  /** Group yaw: local +Z faces the island centre. */
  rotY: number;
}

export const LandmarkContext = createContext<LandmarkCtx | null>(null);

export function useLandmark(): LandmarkCtx {
  const ctx = useContext(LandmarkContext);
  if (!ctx) throw new Error('useLandmark outside a landmark');
  return ctx;
}

/** Landmarks only animate when the player is this close (horizontal metres; low quality halves it). */
const ANIMATE_RADIUS = 140;

/**
 * `useFrame` for a landmark's idle animation that skips work while the player is far away.
 * The callback gets elapsed time and the frame delta.
 */
export function useLandmarkFrame(cb: (t: number, dt: number, state: RootState) => void) {
  const { position } = useLandmark();
  useFrame((state, dt) => {
    const r = useUi.getState().perfTier === 0 ? ANIMATE_RADIUS / 2 : ANIMATE_RADIUS;
    const dx = playerPose.x - position[0];
    const dz = playerPose.z - position[2];
    // During cinematics the camera is elsewhere: use it instead of the player.
    const cam = state.camera.position;
    const near = dx * dx + dz * dz < r * r || (cam.x - position[0]) ** 2 + (cam.z - position[2]) ** 2 < r * r;
    if (near) cb(state.clock.elapsedTime, Math.min(dt, 0.1), state);
  });
}

const ZERO = new Matrix4().makeScale(0, 0, 0);

/** Instanced meshes start hidden (zero scale), so far-away, not-yet-animated instances never show at the origin. */
export function useHiddenInstances(ref: RefObject<InstancedMesh | null>) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < mesh.count; i++) mesh.setMatrixAt(i, ZERO);
    mesh.instanceMatrix.needsUpdate = true;
  }, [ref]);
}

/** Per-instance colours, cycling through `colors` (set once, before the first render). */
export function useInstanceColors(ref: RefObject<InstancedMesh | null>, colors: readonly string[]) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new Color();
    for (let i = 0; i < mesh.count; i++) mesh.setColorAt(i, c.set(colors[i % colors.length]));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [ref, colors]);
}

/**
 * Geometry created once and disposed on unmount. (Animated materials live at module scope in
 * each landmark file instead: each landmark is a one-off, and frame callbacks may mutate them.)
 */
export function useGeo<T extends { dispose: () => void }>(make: () => T): T {
  const [g] = useState(make);
  useEffect(() => () => g.dispose(), [g]);
  return g;
}

/** All of a landmark's static parts as ONE vertex-coloured toon mesh with one outline. */
export function Static({ build, outline = 0.05 }: { build: () => Part[]; outline?: number }) {
  const geometry = useGeo(() => mergeParts(build()));
  return (
    // No receiveShadow: self-shadowing on large flat toon faces shows acne stripes.
    <mesh geometry={geometry} material={vertexToon()} castShadow>
      {outline > 0 && <Outlines thickness={outline} color={COLORS.outline} />}
    </mesh>
  );
}

/** Small captions are unreadable beyond this distance (m) from their landmark, so they're hidden. */
const CAPTION_RADIUS = 60;

/** A group ref that is only visible while the camera is within `radius` of this landmark. */
export function useNearCamera(radius: number) {
  const { position } = useLandmark();
  const ref = useRef<Group>(null);
  useFrame(({ camera }) => {
    const g = ref.current;
    if (g) g.visible = (camera.position.x - position[0]) ** 2 + (camera.position.z - position[2]) ** 2 < radius * radius;
  });
  return ref;
}

/** Small moving details (drones, bubbles, tools…) are specks from afar: draw them only nearby. */
export function Near({ radius = 90, children }: { radius?: number; children: ReactNode }) {
  const ref = useNearCamera(radius);
  return <group ref={ref}>{children}</group>;
}

let frontText: MeshBasicMaterial | null = null;
/** Base material for single-sided captions (troika derives its text shader from it). */
function frontTextMaterial() {
  frontText ??= new MeshBasicMaterial({ side: FrontSide, transparent: true, toneMapped: false });
  return frontText;
}

/** Unlit static parts (windows, lamps, screens) merged into one mesh, no outline. */
export function StaticGlow({ build }: { build: () => Part[] }) {
  const geometry = useGeo(() => mergeParts(build()));
  return <mesh geometry={geometry} material={vertexGlow()} />;
}

/** Small in-world caption (troika text, Geist font bundled in /public). */
export function Caption({
  children,
  size = 0.4,
  color = COLORS.label,
  outline = '#ffffff',
  ...rest
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  outline?: string;
  position?: Vec3;
  rotation?: Vec3;
  anchorX?: 'left' | 'center' | 'right';
  maxWidth?: number;
  /** Hide the mirrored back face (text is double-sided by default), e.g. behind translucent panels. */
  frontOnly?: boolean;
}) {
  const { frontOnly, ...textProps } = rest;
  const near = useNearCamera(CAPTION_RADIUS);
  return (
    <Suspense fallback={null}>
      <group ref={near}>
      <Text
        material={frontOnly ? frontTextMaterial() : undefined}
        font={LABEL_FONT}
        fontSize={size}
        color={color}
        outlineWidth={outline ? size * 0.09 : 0}
        outlineColor={outline || '#ffffff'}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        {...textProps}
      >
        {children}
      </Text>
      </group>
    </Suspense>
  );
}
