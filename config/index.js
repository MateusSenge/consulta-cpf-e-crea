import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// Carregar variáveis de ambiente
dotenv.config({ path: join(rootDir, '.env') });

// Validação das variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'SECRET_KEY',
  'EXTERNAL_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variável de ambiente obrigatória não encontrada: ${envVar}`);
  }
}

// Configurações do servidor
export const serverConfig = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Configurações de segurança
export const securityConfig = {
  secretKey: process.env.SECRET_KEY,
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  rateLimit: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 60000, // 1 minuto
    maxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 10,
    message: {
      error: 'Muitas tentativas. Tente novamente em alguns minutos.',
      code: 'rate_limit_exceeded'
    }
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://apicpf.com", "https://receitaws.com.br", "https://crea-mg.sitac.com.br"]
      }
    },
    crossOriginEmbedderPolicy: false
  }
};

// Configurações das APIs externas
export const apiConfig = {
  externalApi: {
    baseUrl: process.env.EXTERNAL_API_BASE_URL || 'https://apicpf.com/api/consulta',
    apiKey: process.env.EXTERNAL_API_KEY
  },
  cnpjApi: {
    baseUrl: process.env.CNPJ_API_BASE_URL || 'https://receitaws.com.br/v1/cnpj'
  },
  crea: {
    url: process.env.CREA_URL || 'https://crea-mg.sitac.com.br/?servico=profissionais-cadastrados',
    timeout: parseInt(process.env.PUPPETEER_TIMEOUT) || 20000,
    headless: process.env.BROWSER_HEADLESS === 'true'
  }
};

// Validações
export const validationRules = {
  cpf: {
    required: true,
    minLength: 11,
    maxLength: 14,
    pattern: /^[\d\s.\-]{11,14}$/,
    customValidator: (cpf) => {
      const digits = cpf.replace(/\D/g, '');
      return digits.length === 11 && !/^(\d)\1{10}$/.test(digits);
    }
  },
  cnpj: {
    required: true,
    minLength: 14,
    maxLength: 18,
    pattern: /^[\d\s.\/\-]{14,18}$/,
    customValidator: (cnpj) => {
      const digits = cnpj.replace(/\D/g, '');
      return digits.length === 14 && !/^(\d)\1{13}$/.test(digits);
    }
  }
};

// Função para validar entrada
export const validateInput = (input, type) => {
  const rule = validationRules[type];
  if (!rule) return { valid: false, message: 'Tipo de validação inválido' };

  if (!input) {
    return { valid: false, message: 'Entrada obrigatória' };
  }

  const cleanInput = input.replace(/\D/g, '');
  
  if (cleanInput.length < rule.minLength || cleanInput.length > rule.maxLength) {
    return { valid: false, message: `Formato inválido. Use ${type.toUpperCase()} válido` };
  }

  if (rule.pattern && !rule.pattern.test(input)) {
    return { valid: false, message: `Formato ${type.toUpperCase()} inválido` };
  }

  if (rule.customValidator && !rule.customValidator(cleanInput)) {
    return { valid: false, message: `${type.toUpperCase()} inválido` };
  }

  return { valid: true };
};

export default {
  serverConfig,
  securityConfig,
  apiConfig,
  validationRules,
  validateInput
};
