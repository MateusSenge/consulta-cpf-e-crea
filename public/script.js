document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ----- CONFIGURAÇÃO -----
    const API_KEY = '0f418c66da74e50da611ff114ca9eb9ad93626140037a3dd05703f43b63763cd';
    const API_BASE = 'https://apicpf.com/api/consulta?cpf=';
    const CREA_API_ENDPOINT = '/api/consulta-crea';
    const RATE_LIMIT_COUNT = 3;
    const RATE_LIMIT_SECONDS = 60;

    // ----- UI refs -----
    const $ = id => document.getElementById(id);
    const inputCpf = $('cpf'), btnCheck = $('check'), banner = $('banner');
    const sourceSel = $('source'), resultsGrid = $('resultsGrid'), toast = $('toast');
    const outCpf = $('outCpf'), outNome = $('outNome'), outGenero = $('outGenero');
    const outNascimento = $('outNascimento'), outSituacao = $('outSituacao'), outTitulo = $('outTitulo');
    
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
    const cleanCpf = (v) => String(v || '').replace(/[^0-9]/g, '').padStart(11, '0');
    const fmtCpf = (v) => {
        const d = String(v || '').replace(/[^0-9]/g, '');
        if (d.length <= 3) return d;
        if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3);
        if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
        return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9, 11);
    }
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
    }
    
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
        document.querySelectorAll('.crea-field').forEach(f => f.style.display = source === 'crea' ? 'block' : 'none');
        document.getElementById('field-genero').style.display = source === 'api' ? 'block' : 'none';
        document.getElementById('field-nascimento').style.display = source === 'api' ? 'block' : 'none';
    }
    
    function clearResults() {
        outCpf.textContent = '—';
        outNome.textContent = '—';
        outGenero.textContent = '—';
        outNascimento.textContent = '—';
        outSituacao.textContent = '—';
        outTitulo.textContent = '—';
    }

    // ----- Lógica Principal de Consulta -----
    async function handleConsulta() {
        hideBanner();
        if (!checkRateLimit()) { showBanner('error', `Limite de ${RATE_LIMIT_COUNT} consultas por minuto.`); return; }
        const cleaned = cleanCpf(inputCpf.value);
        if (!validaCPF(cleaned)) { showBanner('error', 'CPF inválido (dígito verificador)'); return; }

        addRequestTimestamp();
        btnCheck.disabled = true;
        btnCheck.textContent = 'Consultando...';
        
        const source = sourceSel.value;
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

            // AJUSTE CRÍTICO: A resposta da API pública vem dentro de um objeto 'data'.
            // Verificamos a fonte e pegamos os dados do lugar certo.
            let responseData = data;
            if (source === 'api' && data.data) {
                responseData = data.data; 
            }

            outCpf.textContent = fmtCpf(cleaned);
            outNome.textContent = responseData.nome ? String(responseData.nome).normalize('NFD').replace(/[\u0300-\u36f]/g, "").toUpperCase() : 'NÃO ENCONTRADO';
            
            if (source === 'api') {
                // Usamos 'responseData' que agora aponta para o objeto correto.
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
            if (!countdownInterval) { btnCheck.disabled = false; btnCheck.textContent = 'Consultar'; }
        }
    }

    // ----- Event Listeners -----
    btnCheck.addEventListener('click', handleConsulta);
    sourceSel.addEventListener('change', () => { clearResults(); toggleFields(sourceSel.value) });
    inputCpf.addEventListener('input', (e) => { e.target.value = fmtCpf(e.target.value.replace(/\D/g, '')); });
    
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