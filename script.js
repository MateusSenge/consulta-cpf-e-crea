document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ----- CONFIGURAÇÃO -----
    const API_KEY = '0f418c66da74e50da611ff114ca9eb9ad93626140037a3dd05703f43b63763cd';
    const API_BASE = 'https://apicpf.com/api/consulta?cpf=';
    const RATE_LIMIT_COUNT = 3; // 3 requisições
    const RATE_LIMIT_SECONDS = 60; // por 60 segundos (1 minuto)

    // ----- UI refs -----
    const $ = id => document.getElementById(id);
    const inputCpf = $('cpf');
    const btnCheck = $('check');
    const banner = $('banner');
    const outCpf = $('outCpf');
    const outNome = $('outNome');
    const outGenero = $('outGenero');
    const outNascimento = $('outNascimento');
    const rawBox = $('raw');

    // ----- LÓGICA DE RATE LIMIT -----
    let requestTimestamps = [];
    let countdownInterval = null;

    function checkRateLimit() {
        const now = Date.now();
        // Remove timestamps mais velhos que o limite de tempo
        requestTimestamps = requestTimestamps.filter(ts => (now - ts) / 1000 < RATE_LIMIT_SECONDS);

        if (requestTimestamps.length >= RATE_LIMIT_COUNT) {
            const oldestRequest = requestTimestamps[0];
            const timePassed = (now - oldestRequest) / 1000;
            const timeLeft = Math.ceil(RATE_LIMIT_SECONDS - timePassed);
            startCountdown(timeLeft);
            return false; // Bloqueado
        }
        return true; // Permitido
    }
    
    function startCountdown(seconds) {
        if (countdownInterval) return; // Já está em contagem
        
        btnCheck.disabled = true;
        let timeLeft = seconds;

        countdownInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                btnCheck.disabled = false;
                btnCheck.textContent = 'Consultar';
            } else {
                btnCheck.textContent = `Aguarde ${timeLeft}s`;
                timeLeft--;
            }
        }, 1000);
    }
    
    function addRequestTimestamp() {
        requestTimestamps.push(Date.now());
    }

    // ----- Helpers -----
    const cleanCpf = (v) => String(v || '').replace(/[^0-9]/g, '').padStart(11, '0');
    const fmtCpf = (v) => {
        const d = String(v || '').replace(/[^0-9]/g, '');
        if (d.length <= 3) return d;
        if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3);
        if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
        return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9, 11);
    }
    const validaCPF = (cpf) => { /* ... (código de validação omitido por brevidade, mas deve ser incluído) ... */ return true; }; // Inclua a função de validação completa aqui
    const formatDateAny = (input) => { /* ... */ return input || '—'; }; // Inclua a função de formatação de data aqui
    
    // ----- UI Feedback -----
    const showBanner = (type, message) => {
        banner.style.display = 'block';
        banner.className = 'banner ' + type;
        banner.textContent = message;
    }
    const hideBanner = () => banner.style.display = 'none';

    // ----- Lógica Principal -----
    async function handleConsulta() {
        if (!checkRateLimit()) {
            showBanner('error', `Limite de ${RATE_LIMIT_COUNT} consultas por minuto atingido.`);
            return;
        }

        const cpfValue = inputCpf.value;
        if (!cpfValue) {
            showBanner('error', 'Informe um CPF');
            return;
        }

        const cleaned = cleanCpf(cpfValue);
        if (!validaCPF(cleaned)) {
            showBanner('error', 'CPF inválido (dígito verificador)');
            return;
        }

        addRequestTimestamp();
        btnCheck.disabled = true;
        btnCheck.textContent = 'Consultando...';
        hideBanner();

        try {
            const resp = await fetch(API_BASE + encodeURIComponent(cleaned), {
                method: 'GET',
                headers: { 'X-API-KEY': API_KEY },
                mode: 'cors'
            });

            const data = await resp.json();

            if (!resp.ok) {
                throw new Error(data.message || 'Erro na consulta');
            }

            // Sucesso
            outCpf.textContent = fmtCpf(data.cpf || cleaned);
            outNome.textContent = data.nome ? String(data.nome).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase() : '—';
            outGenero.textContent = data.sexo === 'M' ? 'MASCULINO' : (data.sexo === 'F' ? 'FEMININO' : '—');
            outNascimento.textContent = data.nascimento || '—';
            rawBox.textContent = JSON.stringify(data, null, 2);

        } catch (err) {
            showBanner('error', err.message);
            outCpf.textContent = fmtCpf(cleaned);
            outNome.textContent = '—';
            outGenero.textContent = '—';
            outNascimento.textContent = '—';
            rawBox.textContent = JSON.stringify({ error: err.message }, null, 2);
        } finally {
            if (!countdownInterval) { // Apenas re-habilita se não houver um countdown ativo
                btnCheck.disabled = false;
                btnCheck.textContent = 'Consultar';
            }
        }
    }

    btnCheck.addEventListener('click', handleConsulta);
    inputCpf.addEventListener('input', (e) => {
      e.target.value = fmtCpf(e.target.value);
    });
});

// Nota: As funções `validaCPF` e `formatDateAny` foram omitidas por brevidade.
// Você deve copiar e colar as implementações completas do script anterior.