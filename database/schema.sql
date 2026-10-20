-- 1. Tabela de Usuários (Clientes e Barbeiros)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(20) DEFAULT 'cliente' -- 'cliente' ou 'barbeiro'
);

-- 2. Tabela de Serviços oferecidos na barbearia
CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    duracao_minutos INT NOT NULL
);

-- 3. Tabela de Agendamentos (Onde a mágica acontece)
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    servico_id INT NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    status VARCHAR(30) DEFAULT 'agendado', -- 'agendado', 'concluido', 'cancelado'
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_servico FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

-- Inserindo alguns dados de teste (Seeds)
INSERT INTO usuarios (nome, telefone, email, tipo) 
VALUES ('Carlos Barbeiro', '11999999999', 'carlos@barbearia.com', 'barbeiro'),
       ('João Cliente', '11988888888', 'joao@email.com', 'cliente');

INSERT INTO servicos (nome, preco, duracao_minutos) 
VALUES ('Corte de Cabelo', 40.00, 30),
       ('Barba', 30.00, 20);