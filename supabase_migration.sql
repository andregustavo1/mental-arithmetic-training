-- =============================================
-- MathType - Supabase Schema
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- Tabela principal: dados do jogo (single row, id=1)
CREATE TABLE game_data (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  all_time_best_streak int NOT NULL DEFAULT 0,
  all_time_best_opm float NOT NULL DEFAULT 0,
  total_questions_answered int NOT NULL DEFAULT 0,
  total_correct_answers int NOT NULL DEFAULT 0,
  boss_hunter_best_run int NOT NULL DEFAULT 0,
  boss_hunter_best_bosses int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Inserir a row padrão
INSERT INTO game_data (id) VALUES (1);

-- Tabela de histórico de sessões
CREATE TABLE session_history (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  game_mode text NOT NULL DEFAULT 'classic',
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  boss_hunter_stats jsonb,
  results jsonb
);

-- Habilitar RLS (obrigatório no Supabase)
ALTER TABLE game_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso aberto (single user, sem auth)
CREATE POLICY "Allow all on game_data" ON game_data
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on session_history" ON session_history
  FOR ALL USING (true) WITH CHECK (true);
