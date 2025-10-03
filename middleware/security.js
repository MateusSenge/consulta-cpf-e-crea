import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { securityConfig } from '../config/index.js';

// Middleware de Rate Limiting
export const createRateLimit = () => {
  return rateLimit({
    windowMs: securityConfig.rateLimit.windowMs,
    max: securityConfig.rateLimit.maxRequests,
    message: securityConfig.rateLimit.message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.log(`[SECURITY] Rate limit exceeded for IP: ${req.ip} at ${new Date().toISOString()}`);
      res.status(429).json(securityConfig.rateLimit.message);
    },
    skip: (req) => {
      // Permite mais requisições para development
      return process.env.NODE_ENV === 'development';
    }
  });
};

// Middleware de CORS configurado
export const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = securityConfig.cors.allowedOrigins;
  
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', allowedOrigins[0] || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

// Middleware de Helmet (headers de segurança)
export const helmetMiddleware = helmet(securityConfig.helmet);

// Middleware de logging de segurança
export const securityLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: duration + 'ms'
    };
    
    // Log de alertas de segurança
    if (res.statusCode >= 400) {
      console.warn('[SECURITY WARNING]', logData);
    } else {
      console.log('[ACCESS]', `${logData.method} ${logData.url} - ${logData.statusCode} - ${logData.duration}`);
    }
  });
  
  next();
};

// Middleware de validação de entrada
export const inputValidation = (type) => {
  return async (req, res, next) => {
    const { validateInput } = await import('../config/index.js');
    const paramName = type === 'cpf' ? 'cpf' : 'cnpj';
    const inputValue = req.query[paramName];
    
    const validation = validateInput(inputValue, type);
    
    if (!validation.valid) {
      console.warn(`[SECURITY] Invalid ${type} input from ${req.ip}: ${validation.message}`);
      return res.status(400).json({
        error: validation.message,
        code: `invalid_${type}`
      });
    }
    
    next();
  };
};

// Middleware para sanitizar entrada
export const sanitizeInput = (req, res, next) => {
  // Remove caracteres potencialmente perigosos
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[<>"']/g, '').trim();
  };
  
  // Sanitiza parâmetros da query
  Object.keys(req.query).forEach(key => {
    req.query[key] = sanitizeString(req.query[key]);
  });
  
  // Sanitiza headers importantes
  if (req.headers['user-agent']) {
    req.headers['user-agent'] = sanitizeString(req.headers['user-agent']);
  }
  
  next();
};
