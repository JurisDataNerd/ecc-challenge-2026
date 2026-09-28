-- ==============================================================================
-- ECC FUTURE QUEST: SIAP IMPACT 2026
-- Supabase PostgreSQL Schema & Initial Seeding (PRD v0.2 Alignment)
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends auth.users or stands alone)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('participant', 'mentor', 'admin')),
    city TEXT,
    account_status TEXT NOT NULL DEFAULT 'enabled' CHECK (account_status IN ('enabled', 'disabled')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    features JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Paths Table (Official 3 Tracks: Profesional, Social Impact, Bisnis)
CREATE TABLE IF NOT EXISTS public.paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    archetype_theme TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, code)
);

-- 4. Stages Table (Tahap 1, 2, 3, dan Final Pitching)
CREATE TABLE IF NOT EXISTS public.stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ordinal SMALLINT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    quota_total INT NOT NULL, -- 100 -> 50 -> 25 -> 9 finalis
    opens_at TIMESTAMPTZ NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, ordinal)
);

-- 5. Enrollments Table (Peserta & Jalur Terkunci)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    path_id UUID REFERENCES public.paths(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'eliminated', 'finalist', 'withdrawn')),
    is_path_locked BOOLEAN NOT NULL DEFAULT false,
    path_locked_at TIMESTAMPTZ,
    total_xp INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, profile_id)
);

-- 6. Future Bases Table (Komitmen & Arah Peserta)
CREATE TABLE IF NOT EXISTS public.future_bases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID UNIQUE REFERENCES public.enrollments(id) ON DELETE CASCADE,
    direction TEXT NOT NULL,
    target_90d TEXT NOT NULL,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    support TEXT,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Quests Table (Kuis Musuh & Misi Boss)
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id UUID REFERENCES public.paths(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.stages(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('quiz', 'mission')),
    enemy_name TEXT, -- Nama monster atau Boss di game
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INT NOT NULL DEFAULT 50,
    required BOOLEAN NOT NULL DEFAULT true,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(path_id, stage_id, code)
);

-- 8. Submissions Table (Tugas Boss yang diunggah)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
    workflow_status TEXT NOT NULL DEFAULT 'draft' CHECK (workflow_status IN ('draft', 'submitted', 'in_review', 'changes_requested', 'reviewed')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    file_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(enrollment_id, quest_id)
);

-- 9. Reviews Table (Penilaian Rubrik Juri/Mentor)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.profiles(id),
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    feedback TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Selection Runs & Candidates (Kombinasi skor & 3 finalis per track)
CREATE TABLE IF NOT EXISTS public.selection_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID REFERENCES public.stages(id) ON DELETE CASCADE,
    state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'published')),
    published_by UUID REFERENCES public.profiles(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.selection_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES public.selection_runs(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    quiz_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    mission_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    final_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    decision TEXT NOT NULL CHECK (decision IN ('advance', 'eliminated', 'finalist')),
    rank_in_path INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(run_id, enrollment_id)
);

-- 11. View: Talent Pool (Peserta yang gugur tetap masuk talent pool untuk portofolio)
CREATE OR REPLACE VIEW public.talent_pool_view AS
SELECT 
    e.id AS enrollment_id,
    p.id AS profile_id,
    p.name,
    p.city,
    p.avatar_url,
    pa.code AS path_code,
    pa.title AS path_title,
    e.status,
    e.total_xp,
    fb.direction,
    fb.target_90d,
    fb.skills,
    e.created_at AS joined_at
FROM public.enrollments e
JOIN public.profiles p ON e.profile_id = p.id
JOIN public.paths pa ON e.path_id = pa.id
LEFT JOIN public.future_bases fb ON fb.enrollment_id = e.id
WHERE e.status IN ('eliminated', 'finalist', 'active');
