'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { BoxGeometry, CylinderGeometry, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { getPhase } from '@/data/roadmap';
import { BRIDGE_SIGN_SUBTITLES, ISLAND_TRACK } from '@/data/world';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { SIGN_LAYOUTS, type SignLayout } from '@/lib/worldLayout';
import { LABEL_FONT } from './Landmark';
import ToonInstances from './ToonInstances';

const BOARD_Y = 1.75;
const BOARD_H = 1.05;
const BOARD_D = 0.12;
const POST_H = BOARD_Y + BOARD_H / 2;
const TITLE_SIZE = 0.32;

interface SignInfo extends SignLayout {
  title: string;
  subtitle: string;
  width: number;
}

const signInfo = (s: SignLayout): SignInfo => {
  const phase = getPhase(s.to);
  const title = phase.title;
  const subtitle = BRIDGE_SIGN_SUBTITLES[`${s.on}->${s.to}`] ?? phase.subtitle;
  const longest = Math.max(title.length, subtitle.length * 0.66);
  return { ...s, title, subtitle, width: Math.min(4.2, Math.max(2.2, longest * TITLE_SIZE * 0.58 + 0.6)) };
};

/** Wooden signposts at both ends of every bridge naming the island across it. */
export default function BridgeSigns() {
  const signs = useMemo(() => SIGN_LAYOUTS.map(signInfo), []);
  const geos = useMemo(
    () => ({ board: new BoxGeometry(1, BOARD_H, BOARD_D), post: new CylinderGeometry(0.08, 0.1, POST_H, 6) }),
    [],
  );
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const { boards, posts } = useMemo(() => {
    const boards: Matrix4[] = [];
    const posts: Matrix4[] = [];
    const q = new Quaternion();
    for (const s of signs) {
      q.setFromEuler(new Euler(0, s.rotationY, 0));
      const base = new Vector3(...s.position);
      boards.push(new Matrix4().compose(base.clone().add(new Vector3(0, BOARD_Y, 0)), q, new Vector3(s.width, 1, 1)));
      for (const side of [-1, 1]) {
        const off = new Vector3(side * (s.width / 2 - 0.25), POST_H / 2, -BOARD_D).applyQuaternion(q);
        posts.push(new Matrix4().compose(base.clone().add(off), q, new Vector3(1, 1, 1)));
      }
    }
    return { boards, posts };
  }, [signs]);

  return (
    <>
      <ToonInstances geometry={geos.board} matrices={boards} color={COLORS.signBoard} outline={0.04} />
      <ToonInstances geometry={geos.post} matrices={posts} color={COLORS.woodDark} outline={0.03} />
      <Suspense fallback={null}>
        {signs.map((s) => (
          <group key={s.key} position={s.position} rotation={[0, s.rotationY, 0]}>
            <group position={[0, BOARD_Y, BOARD_D / 2 + 0.01]}>
              {/* "Ahead" chevron */}
              <mesh position={[0, 0.34, 0]} rotation={[0, 0, Math.PI / 2]}>
                <circleGeometry args={[0.12, 3]} />
                <meshBasicMaterial color={TRACK_COLORS[ISLAND_TRACK[s.to]].dark} />
              </mesh>
              <Text font={LABEL_FONT} fontSize={TITLE_SIZE} position={[0, 0.06, 0]} color={COLORS.label} anchorX="center" anchorY="middle">
                {s.title}
              </Text>
              <Text
                font={LABEL_FONT}
                fontSize={TITLE_SIZE * 0.62}
                position={[0, -0.28, 0]}
                color={TRACK_COLORS[ISLAND_TRACK[s.to]].dark}
                anchorX="center"
                anchorY="middle"
              >
                {s.subtitle}
              </Text>
            </group>
          </group>
        ))}
      </Suspense>
    </>
  );
}
