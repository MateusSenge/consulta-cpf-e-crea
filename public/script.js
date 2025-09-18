document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ----- CONFIGURAÇÃO -----
    const API_KEY = '0f418c66da74e50da611ff114ca9eb9ad93626140037a3dd05703f43b63763cd';
    const API_BASE = '/api/consulta-crea';
    const CREA_API_ENDPOINT = '/api/consulta-crea';
    const CNPJ_API_ENDPOINT = '/api/consulta-cnpj';
    const RATE_LIMIT_COUNT = 3;
    const RATE_LIMIT_SECONDS = 60;
    
    // Modo de consulta atual (cpf ou cnpj)
    let currentMode = 'cpf';

    // ----- UI refs -----
    const $ = id => document.getElementById(id);
    const inputCpf = $('cpf'), btnCheck = $('check'), banner = $('banner');
    const sourceSel = $('source'), resultsGrid = $('resultsGrid'), toast = $('toast');
    const outCpf = $('outCpf'), outNome = $('outNome'), outGenero = $('outGenero');
    const outNascimento = $('outNascimento'), outSituacao = $('outSituacao'), outTitulo = $('outTitulo');
    const modeToggle = $('modeToggle');
    const cpfFields = $('cpfFields');
    const cnpjFields = $('cnpjFields');
    
    // ----- LÓGICA DE RATE LIMIT -----
    let requestTimestamps = [];
    let countdownInterval = null;

    function checkRateLimit() {
        const now = Date.now();
        requestTimestamps = requestTimestamps.filter(ts => (now - ts) / 1000 < RATE_LIMIT_SECONDS);
        if (requestTimestamps.length >= RATE_LIMIT_COUNT) {
            const oldestRequest = requestTimestamps[0];
            const timePassed = (now - oldestRequest) / 1000;
            const timeLeft = Math.ceil(RATE_LIMIT_SECONDS - timePassed);
            startCountdown(timeLeft);
            return false;
        }
        return true;
    }
    
    function startCountdown(seconds) {
        if (countdownInterval) return;
        btnCheck.disabled = true;
        let timeLeft = seconds > 0 ? seconds : 1;
        countdownInterval = setInterval(() => {
            btnCheck.textContent = `Aguarde ${timeLeft}s`;
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                btnCheck.disabled = false;
                btnCheck.textContent = 'Consultar';
            }
        }, 1000);
    }
    
    function addRequestTimestamp() {
        requestTimestamps.push(Date.now());
    }

    // ----- Helpers Completos -----
    // Funções para formatação e validação de CPF/CNPJ
    const cleanCpf = (v) => String(v || '').replace(/[^0-9]/g, '').padStart(11, '0');
    
    const fmtCpf = (v) => {
        const d = String(v || '').replace(/[^0-9]/g, '');
        if (d.length <= 3) return d;
        if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3);
        if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
        return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9, 11);
    };
    
    const cleanCnpj = (v) => String(v || '').replace(/[^0-9]/g, '').padStart(14, '0');
    
    const fmtCnpj = (v) => {
        const d = String(v || '').replace(/[^0-9]/g, '');
        if (d.length <= 2) return d;
        if (d.length <= 5) return d.slice(0, 2) + '.' + d.slice(2);
        if (d.length <= 8) return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5);
        if (d.length <= 12) return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5, 8) + '/' + d.slice(8, 12);
        return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5, 8) + '/' + d.slice(8, 12) + '-' + d.slice(12, 14);
    };
    
    const validaCNPJ = (cnpj) => {
        cnpj = String(cnpj || '').replace(/[^0-9]/g, '');
        
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
        
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
    };
    const validaCPF = (cpf) => {
        cpf = String(cpf || '').replace(/[^0-9]/g, '');
        if (!cpf || cpf.length !== 11 || cpf.split('').every(d => d === cpf[0])) {
            return false;
        }
        const nums = cpf.split('').map(n => parseInt(n, 10));
        function calc(slice) {
            let sum = slice.reduce((acc, digit, index) => acc + digit * (slice.length + 1 - index), 0);
            const res = (sum * 10) % 11;
            return (res === 10) ? 0 : res;
        }
        const d1 = calc(nums.slice(0, 9));
        const d2 = calc(nums.slice(0, 10));
        return d1 === nums[9] && d2 === nums[10];
    };
    
    // ----- UI Feedback e Controle -----
    const showBanner = (type, message) => { banner.style.display = 'block'; banner.className = 'banner ' + type; banner.textContent = message; }
    const hideBanner = () => banner.style.display = 'none';

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    function toggleFields(source) {
        if (currentMode === 'cpf') {
            document.querySelectorAll('.crea-field').forEach(f => f.style.display = source === 'crea' ? 'block' : 'none');
            document.getElementById('field-genero').style.display = source === 'api' ? 'block' : 'none';
            document.getElementById('field-nascimento').style.display = source === 'api' ? 'block' : 'none';
            // Esconde campos de CNPJ
            document.querySelectorAll('.cnpj-field').forEach(f => f.style.display = 'none');
        } else {
            // Mostra apenas campos de CNPJ
            document.querySelectorAll('.crea-field, #field-genero, #field-nascimento').forEach(f => f.style.display = 'none');
            document.querySelectorAll('.cnpj-field').forEach(f => f.style.display = 'block');
        }
    }
    
    function clearResults() {
        outCpf.textContent = '—';
        outNome.textContent = '—';
        outGenero.textContent = '—';
        outNascimento.textContent = '—';
        outSituacao.textContent = '—';
        outTitulo.textContent = '—';
        // Limpa campos específicos de CNPJ
        document.querySelectorAll('.cnpj-field .value').forEach(el => {
            el.textContent = '—';
        });
    }

    // Alterna entre modos de consulta (CPF/CNPJ)
    function toggleMode() {
        currentMode = currentMode === 'cpf' ? 'cnpj' : 'cpf';
        inputCpf.placeholder = currentMode === 'cpf' ? 'Digite o CPF' : 'Digite o CNPJ';
        inputCpf.maxLength = currentMode === 'cpf' ? '14' : '18';
        inputCpf.value = '';
        
        // Atualiza o texto do botão de alternância
        modeToggle.textContent = currentMode === 'cpf' ? 'Consultar CNPJ' : 'Consultar CPF';
        
        // Atualiza a fonte de dados para CNPJ (sempre usa a API de CNPJ)
        if (currentMode === 'cnpj') {
            sourceSel.value = 'cnpj';
            sourceSel.disabled = true;
        } else {
            sourceSel.disabled = false;
            sourceSel.value = 'api';
        }
        
        // Atualiza os campos exibidos
        toggleFields(sourceSel.value);
        clearResults();
    }

    // ----- Lógica Principal de Consulta -----
    async function handleConsulta() {
        hideBanner();
        if (!checkRateLimit()) { 
            showBanner('error', `Limite de ${RATE_LIMIT_COUNT} consultas por minuto.`); 
            return; 
        }
        
        const inputValue = inputCpf.value.replace(/[\D]/g, '');
        
        if (currentMode === 'cpf') {
            const cleaned = cleanCpf(inputValue);
            if (!validaCPF(cleaned)) { 
                showBanner('error', 'CPF inválido (dígito verificador)'); 
                return; 
            }
            await consultaCPF(cleaned, sourceSel.value);
        } else {
            const cleaned = cleanCnpj(inputValue);
            if (!validaCNPJ(cleaned)) { 
                showBanner('error', 'CNPJ inválido (dígito verificador)'); 
                return; 
            }
            await consultaCNPJ(cleaned);
        }
    }
    
    // Função para consulta de CPF
    async function consultaCPF(cleaned, source) {
        addRequestTimestamp();
        btnCheck.disabled = true;
        btnCheck.textContent = 'Consultando...';
        
        toggleFields(source);
        clearResults();

        let promise = source === 'crea' 
            ? fetch(`${CREA_API_ENDPOINT}?cpf=${cleaned}`)
            : fetch(API_BASE + encodeURIComponent(cleaned), { headers: { 'X-API-KEY': API_KEY } });
        
        try {
            const rawResponse = await promise;
            const data = await rawResponse.json();
            
            console.log(`[DEBUG] Resposta da fonte '${source}':`, data);

            if (!rawResponse.ok) { throw data; }

            let responseData = data;
            if (source === 'api' && data.data) {
                responseData = data.data; 
            }
            
            outCpf.textContent = fmtCpf(cleaned);
            outNome.textContent = responseData.nome ? String(responseData.nome).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase() : 'NÃO ENCONTRADO';
            
            if (source === 'api') {
                outGenero.textContent = responseData.genero === 'M' ? 'MASCULINO' : (responseData.genero === 'F' ? 'FEMININO' : 'Não informado');
                outNascimento.textContent = responseData.data_nascimento || 'Não informado';
            } else {
                outSituacao.textContent = responseData.situacao || 'Não informado';
                outTitulo.textContent = responseData.titulo || 'Não informado';
            }

        } catch (err) {
            console.error(`[DEBUG] Falha na consulta da fonte '${source}':`, err);
            const errorMessage = err.details || err.message || err.error || 'Erro desconhecido na consulta.';
            showBanner('error', errorMessage);
            outCpf.textContent = fmtCpf(cleaned);
            outNome.textContent = 'FALHA NA CONSULTA';
        } finally {
            if (!countdownInterval) { 
                btnCheck.disabled = false; 
                btnCheck.textContent = 'Consultar'; 
            }
        }
    }
    
    // Função para consulta de CNPJ
    async function consultaCNPJ(cleaned) {
        addRequestTimestamp();
        btnCheck.disabled = true;
        btnCheck.textContent = 'Consultando...';
        
        toggleFields('cnpj');
        clearResults();
        
        try {
            const response = await fetch(`${CNPJ_API_ENDPOINT}?cnpj=${cleaned}`);
            const data = await response.json();
            
            console.log('[DEBUG] Resposta da API de CNPJ:', data);
            
            if (!response.ok) {
                throw data;
            }
            
            // Preenche os campos com os dados da empresa
            outCpf.textContent = data.cnpj || '—';
            outNome.textContent = data.nome ? data.nome.toUpperCase() : 'NÃO ENCONTRADO';
            
            // Preenche os campos específicos de CNPJ
            if (data.nomeFantasia) {
                document.getElementById('outNomeFantasia').textContent = data.nomeFantasia;
            }
            if (data.endereco) {
                const endereco = [];
                if (data.endereco.logradouro) endereco.push(data.endereco.logradouro);
                if (data.endereco.numero) endereco.push(data.endereco.numero);
                if (data.endereco.complemento) endereco.push(data.endereco.complemento);
                document.getElementById('outEndereco').textContent = endereco.join(', ') || '—';
                
                document.getElementById('outBairro').textContent = data.endereco.bairro || '—';
                document.getElementById('outCidade').textContent = data.endereco.municipio || '—';
                document.getElementById('outUF').textContent = data.endereco.uf || '—';
                document.getElementById('outCEP').textContent = data.endereco.cep || '—';
            }
            if (data.cnaePrincipal) {
                document.getElementById('outAtividade').textContent = 
                    `${data.cnaePrincipal.codigo} - ${data.cnaePrincipal.descricao}` || '—';
            }
            if (data.situacao) {
                document.getElementById('outSituacaoCNPJ').textContent = data.situacao;
            }
            if (data.abertura) {
                document.getElementById('outAbertura').textContent = data.abertura;
            }
            if (data.contato) {
                document.getElementById('outTelefone').textContent = data.contato.telefone || '—';
                document.getElementById('outEmail').textContent = data.contato.email || '—';
            }
            
        } catch (err) {
            console.error('[DEBUG] Falha na consulta de CNPJ:', err);
            const errorMessage = err.details || err.message || err.error || 'Erro desconhecido na consulta de CNPJ.';
            showBanner('error', errorMessage);
            outCpf.textContent = fmtCnpj(cleaned);
            outNome.textContent = 'FALHA NA CONSULTA';
        } finally {
            if (!countdownInterval) { 
                btnCheck.disabled = false; 
                btnCheck.textContent = 'Consultar'; 
            }
        }
    }

    // ----- Event Listeners -----
    btnCheck.addEventListener('click', handleConsulta);
    sourceSel.addEventListener('change', () => { clearResults(); toggleFields(sourceSel.value) });
    inputCpf.addEventListener('input', (e) => { 
        e.target.value = currentMode === 'cpf' 
            ? fmtCpf(e.target.value.replace(/\D/g, '')) 
            : fmtCnpj(e.target.value.replace(/\D/g, '')); 
    });
    
    // Adiciona o botão de alternância de modo
    const toggleButton = document.createElement('button');
    toggleButton.id = 'modeToggle';
    toggleButton.type = 'button';
    toggleButton.className = 'toggle-mode';
    toggleButton.textContent = 'Consultar CNPJ';
    toggleButton.addEventListener('click', toggleMode);
    
    // Insere o botão após o formulário
    const form = document.querySelector('form');
    form.parentNode.insertBefore(toggleButton, form.nextSibling);
    
    resultsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('copyable')) {
            const textToCopy = e.target.textContent;
            if (textToCopy && textToCopy !== '—' && textToCopy !== 'Não informado' && textToCopy !== 'N/D') {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => showToast(`"${textToCopy}" copiado!`))
                    .catch(err => console.error('Falha ao copiar:', err));
            }
        }
    });
    
    toggleFields(sourceSel.value);
});