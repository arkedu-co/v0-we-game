-- Criar tabela de configuração da economia
CREATE TABLE IF NOT EXISTS economia_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  salario_diario_atomos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id)
);

-- Adicionar índice para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS economia_config_school_id_idx ON economia_config(school_id);

-- Comentários para documentação
COMMENT ON TABLE economia_config IS 'Configurações da economia para cada escola';
COMMENT ON COLUMN economia_config.salario_diario_atomos IS 'Quantidade de átomos que cada aluno recebe diariamente';
