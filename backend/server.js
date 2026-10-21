const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rota de teste da API
app.get('/', (req, res) => {
    res.json({ mensagem: "API da Barbearia & SaaS rodando com sucesso! 🚀" });
});

// ==================== ROTAS DE SERVIÇOS ====================
app.get('/servicos', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM servicos ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (err) {
        console.error("Erro ao buscar serviços:", err);
        res.status(500).json({ erro: "Erro ao buscar serviços" });
    }
});

app.post('/servicos', async (req, res) => {
    const { nome, preco, categoria, imagem_url } = req.body;
    try {
        const query = `
            INSERT INTO servicos (nome, preco, categoria, imagem_url) 
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const resultado = await db.query(query, [nome, preco, categoria, imagem_url]);
        res.status(201).json({ mensagem: "Serviço cadastrado com sucesso!", servico: resultado.rows[0] });
    } catch (erro) {
        console.error("Erro ao cadastrar serviço:", erro);
        res.status(500).json({ erro: "Erro ao salvar serviço" });
    }
});

app.delete('/servicos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM servicos WHERE id = $1', [id]);
        res.json({ mensagem: "Serviço removido com sucesso!" });
    } catch (erro) {
        console.error("Erro ao deletar serviço:", erro);
        res.status(500).json({ erro: "Erro ao deletar serviço" });
    }
});

// ==================== ROTAS DE AGENDAMENTOS ====================
app.get('/agendamentos', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id, u.nome AS cliente_nome, u.telefone AS cliente_telefone,
                s.nome AS servico_nome, s.preco AS servico_preco,
                a.data_hora, a.status
            FROM agendamentos a
            JOIN usuarios u ON a.usuario_id = u.id
            JOIN servicos s ON a.servico_id = s.id
            ORDER BY a.data_hora DESC;
        `;
        const resultado = await db.query(query);
        res.json(resultado.rows);
    } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
        res.status(500).json({ erro: "Erro ao buscar agendamentos." });
    }
});

app.post('/agendamentos', async (req, res) => {
    const { nome, telefone, servico_id, data_hora, status } = req.body;
    try {
        const telBusca = telefone || '00000000000';
        let usuarioRes = await db.query('SELECT id FROM usuarios WHERE telefone = $1', [telBusca]);
        let usuarioId;

        if (usuarioRes.rows.length > 0) {
            usuarioId = usuarioRes.rows[0].id;
        } else {
            const novoUsuario = await db.query(
                'INSERT INTO usuarios (nome, telefone) VALUES ($1, $2) RETURNING id',
                [nome || 'Cliente Balcão', telBusca]
            );
            usuarioId = novoUsuario.rows[0].id;
        }

        const novoAgendamento = await db.query(
            'INSERT INTO agendamentos (usuario_id, servico_id, data_hora, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [usuarioId, parseInt(servico_id, 10), new Date(data_hora), status || 'agendado']
        );

        res.status(201).json({ mensagem: "Agendamento realizado!", agendamento: novoAgendamento.rows[0] });
    } catch (err) {
        console.error("Erro ao salvar agendamento:", err);
        res.status(500).json({ erro: "Erro interno ao processar agendamento." });
    }
});

app.patch('/agendamentos/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE agendamentos SET status = $1 WHERE id = $2', [status, id]);
        res.json({ mensagem: "Status atualizado com sucesso!" });
    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);
        res.status(500).json({ erro: "Erro ao atualizar status" });
    }
});

// ==================== ROTAS DE GESTÃO SAAS (SUPER ADMIN) ====================

// 1. Listar todas as barbearias cadastradas
app.get('/saas/barbearias', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM assinaturas_saas ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (err) {
        console.error("Erro ao buscar barbearias SaaS:", err);
        res.status(500).json({ erro: "Erro ao carregar dados de assinaturas." });
    }
});

// 2. Atualizar valores, dias de vencimento ou status de uma barbearia
app.patch('/saas/barbearias/:id', async (req, res) => {
    const { id } = req.params;
    const { valor_plano, vencimento_dia, status, expira_em } = req.body;
    try {
        const query = `
            UPDATE assinaturas_saas 
            SET valor_plano = COALESCE($1, valor_plano),
                vencimento_dia = COALESCE($2, vencimento_dia),
                status = COALESCE($3, status),
                expira_em = $4
            WHERE id = $5 RETURNING *;
        `;
        const resultado = await db.query(query, [valor_plano, vencimento_dia, status, expira_em || null, id]);
        
        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: "Barbearia não encontrada." });
        }

        res.json({ mensagem: "Licença atualizada com sucesso!", barbearia: resultado.rows[0] });
    } catch (erro) {
        console.error("Erro ao atualizar licença:", erro);
        res.status(500).json({ erro: "Erro ao atualizar dados da barbearia." });
    }
});

// ==================== ROTAS DE FEEDBACKS ====================
app.get('/feedbacks', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM feedbacks ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (err) {
        console.error("Erro ao buscar feedbacks:", err);
        res.status(500).json({ erro: "Erro ao buscar feedbacks." });
    }
});

app.post('/feedbacks', async (req, res) => {
    const { autor, tipo, nota, comentario } = req.body;
    try {
        const query = `
            INSERT INTO feedbacks (autor, tipo, nota, comentario) 
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const resultado = await db.query(query, [autor, tipo, nota, comentario]);
        res.status(201).json({ mensagem: "Feedback registrado com sucesso!", feedback: resultado.rows[0] });
    } catch (erro) {
        console.error("Erro ao registrar feedback:", erro);
        res.status(500).json({ erro: "Erro ao salvar feedback." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor SaaS rodando na porta ${PORT} 🚀`);
});