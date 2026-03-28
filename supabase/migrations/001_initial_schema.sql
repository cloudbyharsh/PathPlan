-- ============================================================
-- CS OKR Tracker — Initial Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  manager_id  UUID,  -- references users, set after user creation
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('employee', 'manager', 'admin')) DEFAULT 'employee',
  team_id       UUID REFERENCES public.teams(id),
  avatar_initials TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Back-fill the manager reference
ALTER TABLE public.teams
  ADD CONSTRAINT fk_teams_manager FOREIGN KEY (manager_id) REFERENCES public.users(id);

CREATE TABLE public.objectives (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id     UUID REFERENCES public.teams(id),
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  description TEXT,
  quarter     TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year        INTEGER NOT NULL CHECK (year BETWEEN 2020 AND 2030),
  status      TEXT NOT NULL CHECK (status IN ('on_track', 'at_risk', 'off_track', 'completed')) DEFAULT 'on_track',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.key_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id    UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  title           TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 300),
  start_value     NUMERIC NOT NULL DEFAULT 0,
  target_value    NUMERIC NOT NULL,
  current_value   NUMERIC NOT NULL DEFAULT 0,
  unit            TEXT NOT NULL DEFAULT '%',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.progress_updates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_result_id   UUID NOT NULL REFERENCES public.key_results(id) ON DELETE CASCADE,
  submitted_by    UUID NOT NULL REFERENCES public.users(id),
  value           NUMERIC NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_objectives_owner   ON public.objectives(owner_id);
CREATE INDEX idx_objectives_team    ON public.objectives(team_id);
CREATE INDEX idx_objectives_quarter ON public.objectives(year, quarter);
CREATE INDEX idx_key_results_obj    ON public.key_results(objective_id);
CREATE INDEX idx_progress_kr        ON public.progress_updates(key_result_id);
CREATE INDEX idx_progress_created   ON public.progress_updates(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER objectives_updated_at
  BEFORE UPDATE ON public.objectives
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER key_results_updated_at
  BEFORE UPDATE ON public.key_results
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;

-- Users: can read own profile; admin can read all
CREATE POLICY "users_read_own"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users_read_all_admin"
  ON public.users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Teams: team members can read their team
CREATE POLICY "teams_read_own"
  ON public.teams FOR SELECT
  USING (
    id IN (SELECT team_id FROM public.users WHERE id = auth.uid())
  );

-- Objectives: employees see own; managers see team; admin sees all
CREATE POLICY "objectives_select_own"
  ON public.objectives FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "objectives_select_team_manager"
  ON public.objectives FOR SELECT
  USING (
    team_id IN (
      SELECT t.id FROM public.teams t
      JOIN public.users u ON u.id = auth.uid() AND u.role IN ('manager', 'admin')
      WHERE t.id = team_id
    )
  );

CREATE POLICY "objectives_insert_own"
  ON public.objectives FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "objectives_update_own"
  ON public.objectives FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "objectives_delete_own"
  ON public.objectives FOR DELETE
  USING (owner_id = auth.uid());

-- Key results: follows objective ownership
CREATE POLICY "key_results_select"
  ON public.key_results FOR SELECT
  USING (
    objective_id IN (
      SELECT id FROM public.objectives WHERE owner_id = auth.uid()
      UNION
      SELECT o.id FROM public.objectives o
      JOIN public.teams t ON t.id = o.team_id
      JOIN public.users u ON u.id = auth.uid() AND u.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "key_results_write"
  ON public.key_results FOR ALL
  USING (
    objective_id IN (
      SELECT id FROM public.objectives WHERE owner_id = auth.uid()
    )
  );

-- Progress updates: submitter can write; objective owner + manager can read
CREATE POLICY "progress_updates_read"
  ON public.progress_updates FOR SELECT
  USING (
    key_result_id IN (
      SELECT kr.id FROM public.key_results kr
      JOIN public.objectives o ON o.id = kr.objective_id
      WHERE o.owner_id = auth.uid()
        OR o.team_id IN (
          SELECT t.id FROM public.teams t
          JOIN public.users u ON u.id = auth.uid() AND u.role IN ('manager', 'admin')
        )
    )
  );

CREATE POLICY "progress_updates_insert"
  ON public.progress_updates FOR INSERT
  WITH CHECK (submitted_by = auth.uid());

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- SEED DATA (optional — remove for production)
-- ============================================================

-- Insert a demo team (run AFTER creating users via Supabase Auth)
-- INSERT INTO public.teams (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Customer Success');
