import { apiConfig } from '../config/index.js';

export default async function handler(req, res) {
  // CORS já tratado pelo middleware
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { cpf } = req.query;
  
  if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
    return res.status(400).json({ 
      error: 'CPF inválido ou não fornecido.',
      code: 'invalid_cpf'
    });
  }

  const cpfLimpo = cpf.replace(/\D/g, '');

  try {
    console.log(`[EXTERNAL API] Consultando CPF: ${cpfLimpo}`);
    
    const response = await fetch(`${apiConfig.externalApi.baseUrl}?cpf=${cpfLimpo}`, {
      headers: {
        'X-API-KEY': apiConfig.externalApi.apiKey,
        'Accept': 'application/json',
        'User-Agent': 'SENGE-MG-Consulta/1.0'
      },
      timeout: 15000
    });

    if (!response.ok) {
      throw new Error(`API externa retornou status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      return res.status(404).json({
        error: data.error || 'CPF não encontrado',
        code: data.code || 'not_found'
      });
    }

    // Formata os dados de acordo com o formato esperado pelo frontend
    const formattedData = {
      nome: data.data?.nome || data.nome || 'NÃO ENCONTRADO',
      genero: data.data?.genero || data.genero || '',
      data_nascimento: data.data?.data_nascimento || data.data_nascimento || '',
      cpf: cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    };

    console.log(`[EXTERNAL API] Sucesso na consulta do CPF: ${cpfLimpo}`);
    return res.status(200).json(formattedData);
    
  } catch (error) {
    console.error('[EXTERNAL API] Erro na consulta externa:', error);
    return res.status(500).json({
      error: 'Erro interno na consulta externa',
      details: error.message,
      code: 'external_api_error'
    });
  }
}
