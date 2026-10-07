'use client';

import { Suspense } from 'react';
import { ISLANDS } from '@/data/world';
import BalloonDocks from './Balloons';
import Bridges from './Bridge';
import BridgeSigns from './BridgeSigns';
import ChallengePedestals from './ChallengePedestal';
import CloudLayer from './Clouds';
import Island from './Island';
import Landmark from './Landmark';
import LitBridges from './LitBridges';
import Mentors from './Mentor';
import Scenery from './Scenery';
import SkillGems from './SkillGem';

export default function World() {
  return (
    <>
      {ISLANDS.map((def) => (
        <Island key={def.id} def={def} />
      ))}
      <Bridges />
      <LitBridges />
      <BridgeSigns />
      <BalloonDocks />
      <Scenery />
      {ISLANDS.map((def) => (
        <Landmark key={def.id} def={def} />
      ))}
      <Mentors />
      <ChallengePedestals />
      <SkillGems />
      <Suspense fallback={null}>
        <CloudLayer />
      </Suspense>
    </>
  );
}
