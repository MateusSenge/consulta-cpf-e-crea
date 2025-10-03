// Configurações dinâmicas para o frontend
// Este arquivo será populado pelo servidor com configurações seguras

window.APP_CONFIG = {
  // URLs das APIs (definidas pelo servidor)
  endpoints: {
    crea: '/api/consulta-crea',
    cnpj: '/api/consulta-cnpj'
  },
  
  // Configurações de rate limiting
  rateLimit: {
    maxRequests: 15,
    windowSeconds: 60
  },
  
  // Configurações de validação
  validation: {
    cpf: {
      minLength: 11,
      maxLength: 14
    },
    cnpj: {
      minLength: 14,
      maxLength: 18
    }
  }
};
