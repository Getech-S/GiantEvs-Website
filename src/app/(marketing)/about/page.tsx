import type { Metadata } from 'next';

import { AboutStory } from '@/components/sections/about-story';
import { ExperienceCta } from '@/components/sections/experience-cta';
import { PageHeroBand } from '@/components/sections/page-hero-band';
import { Partners } from '@/components/sections/partners';
import { Team } from '@/components/sections/team';
import { VisionMission } from '@/components/sections/vision-mission';

export const metadata: Metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <div>
      <PageHeroBand title="About us" />
      <AboutStory />
      <VisionMission />
      <Team />
      <Partners />
      <ExperienceCta />
    </div>
  );
}
