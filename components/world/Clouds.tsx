'use client';

import { useState } from 'react';
import { Cloud, Clouds } from '@react-three/drei';
import { MeshBasicMaterial } from 'three';
import { getCloudTextureUrl } from '@/lib/cloudTexture';
import { COLORS } from '@/lib/palette';

type CloudDef = { p: [number, number, number]; b: [number, number, number]; seg: number };

// Mostly a cloud sea below the islands, plus a few drifting at eye level / above around the edges.
const CLOUDS: CloudDef[] = [
  { p: [0, -18, -20], b: [22, 3, 14], seg: 16 },
  { p: [20, -16, -75], b: [16, 3, 10], seg: 12 },
  { p: [-30, -22, -115], b: [22, 3, 14], seg: 16 },
  { p: [35, -20, -160], b: [20, 3, 12], seg: 14 },
  { p: [-70, -24, -240], b: [24, 3, 14], seg: 16 },
  { p: [90, -21, -265], b: [24, 3, 14], seg: 16 },
  { p: [0, -28, -300], b: [26, 3, 16], seg: 16 },
  { p: [-100, -20, -335], b: [20, 3, 12], seg: 14 },
  { p: [125, -25, -320], b: [20, 3, 12], seg: 14 },
  { p: [60, -23, -400], b: [22, 3, 12], seg: 14 },
  { p: [-30, -19, -405], b: [22, 3, 12], seg: 14 },
  { p: [-60, 26, -60], b: [16, 3, 8], seg: 10 },
  { p: [80, 32, -120], b: [18, 3, 8], seg: 10 },
  { p: [-160, 22, -290], b: [20, 4, 10], seg: 12 },
  { p: [190, 26, -250], b: [20, 4, 10], seg: 12 },
  { p: [0, 34, -490], b: [24, 4, 10], seg: 12 },
  { p: [40, 18, 70], b: [18, 3, 8], seg: 10 },
];

export default function CloudLayer() {
  const [texture] = useState(getCloudTextureUrl);

  return (
    <>
      {/* Unlit so they stay bright white from every angle (lit sprites turn grey). */}
      <Clouds texture={texture} material={MeshBasicMaterial} limit={260} frustumCulled={false}>
        {CLOUDS.map((c, i) => (
          <Cloud
            key={i}
            seed={i + 1}
            position={c.p}
            bounds={c.b}
            segments={c.seg}
            volume={10}
            growth={6}
            speed={0.08}
            fade={40}
            opacity={0.95}
            color="#ffffff"
            concentrate="inside"
          />
        ))}
      </Clouds>
      {/* Hazy pastel "floor" far below: the fog blends it into the horizon. */}
      <mesh rotation-x={-Math.PI / 2} position={[10, -70, -200]}>
        <circleGeometry args={[1600, 48]} />
        <meshBasicMaterial color={COLORS.void} />
      </mesh>
    </>
  );
}
