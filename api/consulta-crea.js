const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

// Função para formatar o CPF no padrão exigido pelo site do CREA
const formatCpfForCrea = (cpf) => {
    const d = String(cpf || '').replace(/\D/g, '');
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export default async function handler(req, res) {
    // Headers para permitir o acesso via CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { cpf } = req.query;

    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
        return res.status(400).json({ error: 'CPF inválido ou não fornecido.' });
    }

    let browser = null;

    try {
        // Inicia o navegador "invisível" (headless) otimizado para a Vercel
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        // Navega até a página de consulta do CREA-MG
        await page.goto('https://crea-mg.sitac.com.br/?servico=profissionais-cadastrados');

        // Preenche o campo do CPF e clica no botão de pesquisa
        await page.type('#cpfcnpj', formatCpfForCrea(cpf));
        await page.click('button[type="submit"]');

        // Espera a resposta da navegação e o resultado aparecer na tela
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        // Tenta encontrar a tabela de resultados
        const result = await page.evaluate(() => {
            const row = document.querySelector('.table-responsive tbody tr');
            if (!row) {
                return null; // Nenhum resultado encontrado
            }
            // Extrai os dados da tabela
            const nome = row.cells[1]?.innerText.trim();
            const situacao = row.cells[2]?.innerText.trim();
            const titulo = row.cells[3]?.innerText.trim();
            
            return { nome, situacao, titulo };
        });

        if (!result) {
            return res.status(404).json({ message: 'Profissional não encontrado no CREA-MG.' });
        }

        // Sucesso! Retorna os dados encontrados.
        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Falha ao realizar o scraping no site do CREA-MG.', details: error.message });
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
}