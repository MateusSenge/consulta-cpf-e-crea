// Validação de CNPJ
function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[\D]/g, '');
  
  if (cnpj.length !== 14) return false;
  
  // Elimina CNPJs invalidos conhecidos
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Valida DVs
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
}

// Formata CNPJ
function formatarCNPJ(cnpj) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

// Função principal da API
export default async function handler(req, res) {
  // Configurações de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responde imediatamente para requisições OPTIONS (pré-voo)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { cnpj } = req.query;
  
  // Validação básica do CNPJ
  if (!cnpj || !validarCNPJ(cnpj)) {
    return res.status(400).json({ 
      error: 'CNPJ inválido ou não fornecido.',
      code: 'invalid_cnpj'
    });
  }

  try {
    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/[\D]/g, '');
    
    // Faz a requisição para a API da Receita WS
    const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao consultar CNPJ na Receita WS');
    }

    const data = await response.json();
    
    // Verifica se a consulta retornou erro
    if (data.status === 'ERROR') {
      return res.status(404).json({
        error: data.message || 'CNPJ não encontrado',
        code: data.code || 'not_found'
      });
    }

    // Formata os dados para retorno
    const empresa = {
      cnpj: formatarCNPJ(cnpjLimpo),
      nome: data.nome || '',
      nomeFantasia: data.fantasia || '',
      tipo: data.tipo || '',
      abertura: data.abertura || '',
      situacao: data.situacao || '',
      situacaoEspecial: data.situacao_especial || '',
      dataSituacao: data.data_situacao || '',
      motivoSituacao: data.motivo_situacao || '',
      cnaePrincipal: {
        codigo: data.atividade_principal?.[0]?.code || '',
        descricao: data.atividade_principal?.[0]?.text || ''
      },
      endereco: {
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cep: data.cep ? data.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2") : '',
        municipio: data.municipio || '',
        uf: data.uf || ''
      },
      contato: {
        telefone: data.telefone || '',
        email: data.email || ''
      }
    };

    return res.status(200).json(empresa);
    
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error);
    return res.status(500).json({
      error: 'Erro ao consultar CNPJ',
      details: error.message,
      code: 'internal_error'
    });
  }
}
