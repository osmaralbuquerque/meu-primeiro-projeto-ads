
-- Criando a tabela de Categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

-- Criando a tabela de Produtos
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    quantidade INT DEFAULT 0,
    categoria_id INT,
    CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Inserindo dados iniciais de teste
INSERT INTO categorias (nome) VALUES ('Eletrónicos'), ('Escritório');

INSERT INTO produtos (nome, preco, quantidade, categoria_id) 
VALUES ('Teclado Mecânico', 150.00, 10, 1),
       ('Cadeira Ergonómica', 850.00, 5, 2);