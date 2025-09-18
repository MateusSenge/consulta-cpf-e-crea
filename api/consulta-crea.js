const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const formatCpfForCrea = (cpf) => {
    const d = String(cpf || '').replace(/\D/g, '');
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { cpf } = req.query;

    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
        return res.status(400).json({ error: 'CPF inválido ou não fornecido.' });
    }

    let browser = null;
    const TIMEOUT = 15000; // Aumentamos o timeout para 15 segundos

    try {
        console.log('[CREA Scraper] Iniciando...');
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(TIMEOUT);
        
        console.log('[CREA Scraper] Navegando para a página do CREA...');
        await page.goto('https://crea-mg.sitac.com.br/?servico=profissionais-cadastrados');
        
        console.log('[CREA Scraper] Procurando campo de CPF...');
        await page.waitForSelector('#cpfcnpj', { timeout: TIMEOUT });
        await page.type('#cpfcnpj', formatCpfForCrea(cpf));
        
        console.log('[CREA Scraper] Clicando no botão de busca...');
        await page.waitForSelector('button[type="submit"]', { timeout: TIMEOUT });
        await page.click('button[type="submit"]');

        console.log('[CREA Scraper] Aguardando resultados...');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        console.log('[CREA Scraper] Extraindo dados da tabela de resultados...');
        const result = await page.evaluate(() => {
            const row = document.querySelector('.table-responsive tbody tr');
            if (!row || row.innerText.includes("Nenhum registro encontrado")) {
                return null;
            }
            const nome = row.cells[1]?.innerText.trim();
            const situacao = row.cells[2]?.innerText.trim();
            const titulo = row.cells[3]?.innerText.trim();
            return { nome, situacao, titulo };
        });

        if (!result) {
            console.log('[CREA Scraper] Profissional não encontrado.');
            return res.status(404).json({ message: 'Profissional não encontrado no CREA-MG.' });
        }
        
        console.log('[CREA Scraper] Sucesso!');
        return res.status(200).json(result);

    } catch (error) {
        console.error('[CREA Scraper] ERRO CRÍTICO:', error);
        // Retornamos o erro detalhado para o front-end poder exibir no console
        return res.status(500).json({ 
            error: 'Falha ao realizar o scraping no site do CREA-MG.', 
            details: error.message 
        });
    } finally {
        if (browser !== null) {
            await browser.close();
            console.log('[CREA Scraper] Navegador fechado.');
        }
    }
}