import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import consultaCrea from './api/consulta-crea.js';
import consultaCnpj from './api/consulta-cnpj.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rotas da API
app.get('/api/consulta-crea', (req, res) => consultaCrea(req, res));
app.get('/api/consulta-cnpj', (req, res) => consultaCnpj(req, res));

// Servir arquivos estáticos da pasta public
app.use(express.static(join(__dirname, 'public')));

// Rota para qualquer outra requisição, servir o index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
