const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão usando o driver 'pg'
const pool = new Pool({
    user: 'postgres',          // O usuário padrão do Postgres
    host: 'localhost',         // Como o banco está no seu PC
    database: 'barbearia_db',  // O nome do banco que criamos no pgAdmin
    password: 'Ov1447@',     // Substitua pela senha que você usa no pgAdmin
    port: 5432,                // Porta padrão do PostgreSQL
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
