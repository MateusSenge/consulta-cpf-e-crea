// Mensagem especial para desenvolvedores no DevTools
(function() {
  'use strict';
  
  const logo = `
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║  🚀 Sistema de Consulta CPF/CNPJ - SENGE-MG             ║
║                                                          ║
║  🛠️  Desenvolvido por: Mateus Teixeira                   ║
║  📧 Instagram: @theuska._                                ║
║  💼 Todos os direitos reservados                        ║
║                                                          ║
║     ╔═══════════════════════════════════════╗            ║
║     ║                                       ║            ║
║     ║  💡 Se precisa de um sistema similar, ║            ║
║     ║      faça um orçamento!               ║            ║
║     ║                                       ║            ║
║     ║  📱 Instagram: @theuska._             ║            ║
║     ║                                       ║            ║
║     ╚═══════════════════════════════════════╝            ║
║                                                          ║
║  🌟 Sistema desenvolvido com segurança e qualidade      ║
║  🔒 Protegido por múltiplas camadas de segurança         ║
║  ⚡ Otimizado para performance e mobilidade              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`;

  // Função para detectar quando DevTools está aberto
  function detectDevTools() {
    const threshold = 160;
    
    const detect = function() {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        return true;
      }
      return false;
    };
    
    // Verifica imediatamente
    if (detect()) {
      showDevMessage();
      return;
    }
    
    // Continua verificando periodicamente
    const interval = setInterval(() => {
      if (detect()) {
        showDevMessage();
        clearInterval(interval);
      }
    }, 500);
  }
  
  function showDevMessage() {
    // Evita mostrar múltiplas vezes
    if (document.querySelector('.devtools-detected')) {
      return;
    }
    
    // Adiciona marca para evitar múltiplas exibições
    const marker = document.createElement('div');
    marker.className = 'devtools-detected';
    marker.style.display = 'none';
    document.body.appendChild(marker);
    
    // Styles para o console
    console.clear();
    console.log('%c' + logo, 'color: #0b5ed7; font-family: Courier, monospace; font-size: 11px; font-weight: bold; line-height: 1.2;');
    
    console.log('%c📞 Contato para Orçamentos de Sistemas Web', 'color: #2c7be5; font-size: 16px; font-weight: bold;');
    console.log('%cInstagram: @theuska._', 'color: #1f9d55; font-size: 14px; font-weight: bold;');
    console.log('%c💼 Desenvolvido por Mateus Teixeira', 'color: #6b7280; font-size: 12px;');
    console.log('%c⚖️ Todos os direitos reservados', 'color: #6b7280; font-size: 12px;');
    console.log('%c', 'color: #0b5ed7;');
    console.log('%c🔧 Este sistema foi desenvolvido com:', 'color: #a7b5c8; font-weight: bold;');
    console.log('%c   ✓ Node.js + Express', 'color: #1f9d55;');
    console.log('%c   ✓ Segurança Avançada (Rate Limiting, Helmet, CORS)', 'color: #1f9d55;');
    console.log('%c   ✓ Validação Rigorosa de Dados', 'color: #1f9d55;');
    console.log('%c   ✓ Interface Responsiva', 'color: #1f9d55;');
    console.log('%c   ✓ APIs Internas Seguras', 'color: #1f9d55;');
    console.log('%c   ✓ Logs de Segurança', 'color: #1f9d55;');
    console.log('%c', 'color: #0b5ed7;');
    console.log('%c🚀 Precisa de algo similar? Entre em contato!', 'color: #d9534f; font-size: 14px; font-weight: bold;');
  }
  
  // Detecta DevTools quando a página carrega
  if (document.readyState === 'complete') {
    detectDevTools();
  } else {
    document.addEventListener('DOMContentLoaded', detectDevTools);
  }
  
  // Também pode ser trigerado diretamente
  window.__DEVTOOLS_MESSAGE__ = showDevMessage;
})();
