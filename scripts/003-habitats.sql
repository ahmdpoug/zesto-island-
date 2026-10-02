CREATE TABLE IF NOT EXISTS zesto_payments (
  tx_hash TEXT PRIMARY KEY,
  wallet TEXT NOT NULL,
  action TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zesto_islands (
  wallet TEXT PRIMARY KEY,
  tiles TEXT NOT NULL,
  radius INTEGER NOT NULL DEFAULT 2,
  seeds INTEGER NOT NULL DEFAULT 40,
  seeds_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  discovered JSONB NOT NULL DEFAULT '[]'::jsonb,
  wonders JSONB NOT NULL DEFAULT '[]'::jsonb,
  hints JSONB NOT NULL DEFAULT '[]'::jsonb,
  spirits JSONB NOT NULL DEFAULT '[]'::jsonb,
  lanterns INTEGER NOT NULL DEFAULT 0,
  placements INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_checkin DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zesto_lanterns (
  owner TEXT NOT NULL,
  visitor TEXT NOT NULL,
  day DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (owner, visitor, day)
);

CREATE INDEX IF NOT EXISTS zesto_sessions_wallet_idx ON zesto_sessions (wallet);
