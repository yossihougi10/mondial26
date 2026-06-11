-- ===== MONDIAL 2026 - Supabase Schema =====
-- הרץ את הקובץ הזה ב-SQL Editor של Supabase

-- פרופילי משתמשים (מרחיב את auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "כולם יכולים לצפות בפרופילים" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "משתמשים יכולים לעדכן פרופיל שלהם" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "מערכת יוצרת פרופיל בהרשמה" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- פונקציה ליצירת פרופיל אוטומטי בהרשמה
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- טבלת משחקים
CREATE TABLE IF NOT EXISTS public.matches (
  id BIGINT PRIMARY KEY,
  utc_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  matchday INTEGER,
  stage TEXT NOT NULL,
  group_name TEXT,
  home_team_id BIGINT,
  home_team_name TEXT NOT NULL,
  home_team_short TEXT,
  home_team_crest TEXT,
  away_team_id BIGINT,
  away_team_name TEXT NOT NULL,
  away_team_short TEXT,
  away_team_crest TEXT,
  home_score_full INTEGER,
  away_score_full INTEGER,
  home_score_et INTEGER,
  away_score_et INTEGER,
  home_score_penalties INTEGER,
  away_score_penalties INTEGER,
  winner TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "כולם יכולים לצפות במשחקים" ON public.matches
  FOR SELECT USING (true);

-- רק service_role יכול לשנות משחקים (דרך API routes)
CREATE POLICY "service_role יכול לשנות משחקים" ON public.matches
  FOR ALL USING (auth.role() = 'service_role');

-- טבלת ניחושים
CREATE TABLE IF NOT EXISTS public.guesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id BIGINT REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  prediction TEXT,                    -- לשלב הבתים: '1', 'X', '2'
  predicted_home_score INTEGER,       -- לשלב הנוקאאוט
  predicted_away_score INTEGER,       -- לשלב הנוקאאוט
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE public.guesses ENABLE ROW LEVEL SECURITY;

-- ניחושים ננעלים = כולם רואים; ניחושים פתוחים = רק הבעלים
CREATE POLICY "צפייה בניחושים" ON public.guesses
  FOR SELECT USING (
    auth.uid() = user_id OR is_locked = true
  );

CREATE POLICY "הכנסת ניחוש" ON public.guesses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "עדכון ניחוש שלא ננעל" ON public.guesses
  FOR UPDATE USING (
    auth.uid() = user_id AND is_locked = false
  );

CREATE POLICY "service_role מלא" ON public.guesses
  FOR ALL USING (auth.role() = 'service_role');

-- טבלת ניקוד
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id BIGINT REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  result_type TEXT,  -- 'exact' (3), 'direction' (1), 'wrong' (0)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "כולם יכולים לצפות בניקוד" ON public.scores
  FOR SELECT USING (true);

CREATE POLICY "service_role מנהל ניקוד" ON public.scores
  FOR ALL USING (auth.role() = 'service_role');

-- View לטבלת דירוג
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id,
  p.display_name,
  p.email,
  COALESCE(SUM(s.points), 0) AS total_points,
  COUNT(s.id) AS games_scored,
  COUNT(CASE WHEN s.result_type = 'exact' THEN 1 END) AS exact_count,
  COUNT(CASE WHEN s.result_type = 'direction' THEN 1 END) AS direction_count
FROM public.profiles p
LEFT JOIN public.scores s ON p.id = s.user_id
GROUP BY p.id, p.display_name, p.email
ORDER BY total_points DESC, exact_count DESC;
