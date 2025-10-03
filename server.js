import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import consultaCrea from './api/consulta-crea.js';
import consultaCnpj from './api/consulta-cnpj.js';
import consultaExterna from './api/consulta-externa.js';
import { serverConfig } from './config/index.js';
import { 
  createRateLimit, 
  corsMiddleware, 
  helmetMiddleware, 
  securityLogger,
  sanitizeInput,
  inputValidation
} from './middleware/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middlewares de Segurança
app.use(helmetMiddleware);
app.use(createRateLimit());
app.use(securityLogger);
app.use(sanitizeInput);
app.use(corsMiddleware);

// Rotas da API com validação
app.get('/api/consulta-crea', inputValidation('cpf'), (req, res) => consultaCrea(req, res));
app.get('/api/consulta-cnpj', inputValidation('cnpj'), (req, res) => consultaCnpj(req, res));
app.get('/api/consulta-externa', inputValidation('cpf'), (req, res) => consultaExterna(req, res));

// Servir arquivos estáticos da pasta public
app.use(express.static(join(__dirname, 'public')));

// Rota para qualquer outra requisição, servir o index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(serverConfig.port, () => {
  console.log(`🔒 Servidor seguro rodando em http://localhost:${serverConfig.port}`);
  console.log(`🌍 Ambiente: ${serverConfig.nodeEnv}`);
  console.log(`🚀 Sistema de consulta CPF/CNPJ iniciado com segurança`);
});
