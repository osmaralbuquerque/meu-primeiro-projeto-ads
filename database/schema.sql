-- 1. Tabela de Usuários (Clientes identificados por telefone)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE
);

-- 2. Tabela de Serviços (Com suporte a categorias e imagens para o carrossel)
CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    duracao_minutos INT NOT NULL,
    categoria VARCHAR(30) DEFAULT 'masculino', -- 'masculino' ou 'feminino'
    imagem_url TEXT -- Link ou caminho da foto do corte
);

-- Inserindo alguns dados de exemplo caso sua tabela esteja vazia
INSERT INTO servicos (nome, preco, duracao_minutos, categoria, imagem_url) VALUES 
('Corte Degradê', 40.00, 30, 'masculino', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c'),
('Barba Completa', 30.00, 20, 'masculino', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1'),
('Corte Feminino & Escova', 70.00, 50, 'feminino', 'https://images.unsplash.com/photo-1560869713-7d0a29430803')
ON CONFLICT DO NOTHING;

-- 3. Tabela de Agendamentos Relacionada
CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    servico_id INT NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    status VARCHAR(30) DEFAULT 'agendado',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);