import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// Helper para formatar o CPF
const formatCpfForCrea = (cpf) => String(cpf || '').replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

// Nossa função principal, agora mais limpa
export default async function handler(req, res) {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { cpf } = req.query;
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
        return res.status(400).json({ error: 'CPF inválido ou não fornecido.' });
    }

    let browser = null;
    console.log('[CREA Scraper] Iniciando consulta para CPF:', cpf);

    try {
        // Lança o navegador usando o novo pacote, que funciona na Vercel
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless, // 'new' para headless moderno
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        const TIMEOUT = 20000; // Aumentamos o timeout para 20 segundos
        page.setDefaultNavigationTimeout(TIMEOUT);
        
        console.log('[CREA Scraper] Navegando para a página do CREA...');
        await page.goto('https://crea-mg.sitac.com.br/?servico=profissionais-cadastrados');

        console.log('[CREA Scraper] Preenchendo formulário...');
        await page.waitForSelector('#cpfcnpj', { timeout: TIMEOUT });
        await page.type('#cpfcnpj', formatCpfForCrea(cpf));
        
        await page.waitForSelector('button[type="submit"]', { timeout: TIMEOUT });
        await page.click('button[type="submit"]');

        console.log('[CREA Scraper] Aguardando resultados...');
        // Esperamos que a página carregue e que a tabela de resultados ou uma mensagem de erro apareça
        await page.waitForSelector('.table-responsive, .alert-warning', { timeout: TIMEOUT });
        
        console.log('[CREA Scraper] Extraindo dados da página...');
        const result = await page.evaluate(() => {
            const errorAlert = document.querySelector('.alert-warning');
            if (errorAlert && errorAlert.innerText.includes("Nenhum registro encontrado")) {
                return { notFound: true };
            }

            const row = document.querySelector('.table-responsive tbody tr');
            if (!row) {
                return { error: "A estrutura da tabela de resultados não foi encontrada." };
            }
            
            const nome = row.cells[1]?.innerText.trim();
            const situacao = row.cells[2]?.innerText.trim();
            const titulo = row.cells[3]?.innerText.trim();
            
            return { nome, situacao, titulo };
        });

        if (result.notFound) {
            console.log('[CREA Scraper] Profissional não encontrado.');
            return res.status(404).json({ message: 'Profissional não encontrado no CREA-MG.' });
        }
        
        if (result.error) {
             console.log('[CREA Scraper] Erro na estrutura do site:', result.error);
             throw new Error(result.error);
        }
        
        console.log('[CREA Scraper] Sucesso!');
        return res.status(200).json(result);

    } catch (error) {
        console.error('[CREA Scraper] ERRO CRÍTICO:', error);
        return res.status(500).json({ 
            error: 'Falha crítica no processo de scraping.', 
            details: error.message 
        });
    } finally {
        if (browser !== null) {
            await browser.close();
            console.log('[CREA Scraper] Navegador fechado.');
        }
    }
}