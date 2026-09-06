import { StoryCard } from '@/components/ui/story-card';
import { stories, storiesSection } from '@/lib/site';

/**
 * Latest stories, three across. Server component — all animation is CSS.
 */
export function Stories() {
  return (
    <section aria-labelledby="stories-heading" className="bg-white py-20 sm:py-25">
      <div className="container-page">
        <p
          className="font-tag reveal-up text-brand-500 text-center text-[1rem] leading-4 font-bold tracking-[0.5px]"
          style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
        >
          {storiesSection.eyebrow}
        </p>

        <h2
          id="stories-heading"
          className="font-display reveal-up mt-4 text-center text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-black"
          style={
            { '--rev-start': '14%', '--rev-end': '62%', '--rev-delay': '0.12s' } as React.CSSProperties
          }
        >
          {storiesSection.headline}
        </h2>

        {/*
          24px between the 424px columns, matching the other card grids. Three
          across only from `lg`; a two-column stage orphans the third card, and
          below that the single column is capped at the card's design width so
          the 3:2 images never blow up to full bleed.
        */}
        <ul className="mx-auto mt-10 grid max-w-[26.5rem] grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
          {stories.map((story, index) => (
            <li key={story.id} className="h-full">
              <StoryCard story={story} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
