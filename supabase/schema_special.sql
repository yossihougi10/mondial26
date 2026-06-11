-- הרץ את זה ב-SQL Editor של Supabase (בנוסף ל-schema.sql הקיים)

CREATE TABLE IF NOT EXISTS public.special_bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('champion', 'top_scorer')),
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bet_type)
);

ALTER TABLE public.special_bets ENABLE ROW LEVEL SECURITY;

-- כולם יכולים לקרוא (הפרונטאנד שולט על מה מוצג)
CREATE POLICY "authenticated read all special bets" ON public.special_bets
  FOR SELECT TO authenticated USING (true);

-- כל משתמש כותב רק לעצמו
CREATE POLICY "insert own special bet" ON public.special_bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update own special bet" ON public.special_bets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "service_role full access special_bets" ON public.special_bets
  FOR ALL USING (auth.role() = 'service_role');
