-- Giant Evs database schema.
--
-- Run once (and safely re-runnable) via: node scripts/init-db.mjs
-- IDs stay plain-text UUID strings (randomUUID()), matching the ids already
-- used by every existing station/news record, so migrating from the old
-- JSON files never has to change an id anyone's already looking at.

CREATE TABLE IF NOT EXISTS stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  connectors TEXT[] NOT NULL DEFAULT '{}',
  free_bays INTEGER NOT NULL,
  total_bays INTEGER NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- body/cover_image are JSONB: the article body is a heterogeneous list of
-- content blocks (paragraph/heading/list/image — see lib/news/types.ts),
-- simplest stored as the same JSON shape the app already works with rather
-- than normalizing it into extra tables no admin UI needs.
CREATE TABLE IF NOT EXISTS news_articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image JSONB NOT NULL,
  body JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
