# 🚀 Sistema de Consulta CPF/CNPJ - SENGE-MG

<div align="center">
  <img src="public/favicon.png" width="100" alt="Logo SENGE-MG">
  
  <h3>🔍 Sistema profissional de consulta de CPF e CNPJ com interface moderna</h3>
  <p><strong>Desenvolvido por:</strong> <a href="https://instagram.com/theuska._">Mateus Teixeira</a></p>
  
  <p>
    <a href="#funcionalidades">📋 Funcionalidades</a> • 
    <a href="#tecnologias">⚡ Tecnologias</a> • 
    <a href="#deployment">🚀 Deploy</a> • 
    <a href="#temas">🎨 Temas</a> • 
    <a href="#suporte">💬 Suporte</a>
  </p>
  
  ![Status](https://img.shields.io/badge/Status-Produção%20Ready-success.svg)
  ![Temas](https://img.shields.io/badge/Temas-Claro%20%7C%20Escuro-blue.svg)
  ![Segurança](https://img.shields.io/badge/Segurança-Avançada-green.svg)
  ![Mobile](https://img.shields.io/badge/Mobile-Responsivo-orange.svg)
</div>

---

## 🎯 **Funcionalidades**

### 🔍 **Consultas Disponíveis**
- ✅ **CPF via API Externa** - Consulta completa de dados pessoais
- ✅ **CNPJ via Receita WS** - Dados completos de empresas
- ⚠️ **CREA-MG** - Modal elegante informando indisponibilidade temporária

### 🎨 **Interface Moderna e Temas**
- 🎭 **Sistema Dual Theme** - Clara e Escura com switch flutuante
- 🌟 **Design Glassmorphism** - Visual moderno e profissional
- 📱 **Mobile-First** - Responsivo e otimizado para celulares
- 🔄 **Transições Suaves** - Animações elegantes em toda interface
- 🪟 **Modal Inteligente** - Para funcionalidades temporariamente indisponíveis
- 💡 **Status em Tempo Real** - Indicador visual das operações

### 📊 **Feedback Visual Avançado**
- 🟢 **Status Dot** - Verde (Online) / Vermelho (Consultando) / Azul (Sucesso)
- 📈 **Contador de Consultas** - Visualização do rate limit (X/15 consultas/minuto)
- ✨ **Auto-preenchimento Animado** - Campos preenchem com efeito flash
- 🔔 **Toast Notifications** - Feedback imediato das ações
- 📋 **Select Inteligente** - Aparece/desaparece baseado no modo (CPF/CNPJ)

### 🛡️ **Segurança Avançada**
- 🔒 **Rate Limiting** - 15 consultas/minuto configuráveis
- ✅ **Validação Rigorosa** - CPF/CNPJ validados antes do processamento
- 📡 **Headers Seguros** - Helmet.js para proteção contra ataques comuns
- 🌐 **CORS Restrito** - Apenas domínios autorizados
- 🧹 **Sanitização** - Entrada automática de dados perigosos
- 📝 **Logs Detalhados** - Monitoramento de segurança em tempo real

### 💾 **Persistência e Configuração**
- ⚙️ **Variáveis de Ambiente** - Configuração centralizada e segura
- 💿 **localStorage** - Preferências de tema salvas automaticamente
- 🔧 **Sistema Modular** - Código organizado e escalável
- 📦 **APIs Internas** - Chamadas externas abstraídas para segurança

---

## ⚡ **Tecnologias**

<details>
<summary>🔧 Stack Principal</summary>

**Backend:**
- Node.js (ES Modules)
- Express.js
- dotenv (configuração)
- helmet (segurança)
- express-rate-limit (limitação)
- express-validator (validação)

**Frontend:**
- HTML5 Semântico
- CSS3 Moderno (Grid/Flexbox)
- JavaScript ES6+ (Vanilla)
- Glassmorphism Design
- Dual Theme System
- CSS Custom Properties

**APIs Externas:**
- Receita WS (CNPJ)
- APICPF.com (CPF)
- CREA-MG (futuramente)

**Deploy:**
- Vercel (serverless)
- GitHub Actions (CI/CD)

**Funcionalidades Especiais:**
- localStorage para persistência
- CSS Custom Properties para temas
- RequestAnimationFrame para animações otimizadas
- Event Delegation para performance

</details>

---

## 🚀 **Deploy no Vercel**

### **📋 Pré-requisitos**
```bash
# Clonar o repositório
git clone <seu-repo>
cd sistema-consulta-cpf-cnpj

# Instalar dependências
npm install
```

### **⚙️ Configuração**

1. **Copiar arquivo de ambiente:**
```bash
cp .env.example .env
```

2. **Configurar variáveis no Vercel:**
```bash
# Variáveis obrigatórias
SECRET_KEY=sua-chave-secreta-forte
EXTERNAL_API_KEY=sua-api-key-do-apicpf

# Configurações opcionais
API_RATE_LIMIT_MAX_REQUESTS=15
CORS_ALLOWED_ORIGINS=https://seudominio.com
```

### **🌐 Deploy Automático**

1. **Conectar ao GitHub:**
   - Faça fork ou conecte seu repositório
   - Acesse [vercel.com](https://vercel.com)
   - Import o projeto do GitHub

2. **Configurar Variáveis de Ambiente:**
   ```
   Vercel Dashboard → Project Settings → Environment Variables
   ```

3. **Deploy:**
   ```
   Push das mudanças = Deploy automático ✅
   ```

### **📱 URLs de Acesso**
- **Produção:** `https://seuprojeto.vercel.app`
- **Preview:** `https://seuprojeto-git-branch.vercel.app`

---

## 🎨 **Sistema de Temas**

### 🌙 **Tema Escuro (Padrão)**
- Background: Azul escuro profundo (#0f172a)
- Cards: Vidro escuro translúcido
- Texto: Branco suave (#e6eef8)
- Botões: Azul profissional (#0b5ed7 → #2c7be5)
- Contraste: Alto para legibilidade noturna

### ☀️ **Tema Claro**
- Background: Cinza claro suave (#f8f9fa)
- Cards: Branco sólido (#ffffff)
- Texto: Preto suave (#212121)
- Botões: Azul profissional (#0b5ed7 → #2c7be5)
- Contraste: Ótimo para uso diurno

### 🔄 **Funcionalidades do Tema**
- 💾 **Persistência** - Escolha salva no localStorage
- 🪟 **Switch Flutuante** - Botão circular no canto superior direito
- ⚡ **Transições Suaves** - Mudança instantânea sem flash
- 🎭 **Ícones Dinâmicos** - 🌙/☀️ muda conforme tema atual

---

## 💬 **Suporte e Contato**

### **🛠️ Desenvolvido por Mateus Teixeira**

<div align="center">
  
  **📱 Instagram:** [@theuska._](https://instagram.com/theuska._)
  
  **💼 Precisa de sistemas similares? Faça um orçamento!**
  
  *Especialista em desenvolvimento web profissional com segurança avançada*

</div>

### **🔧 Customizações Disponíveis**
- Sistema de autenticação/autorização
- Integração com mais bancos de dados
- Dashboard administrativo
- Relatórios e estatísticas
- APIs customizadas para seu negócio
- Sistemas de e-commerce
- Landing pages profissionais
- **Novos temas** e personalizações visuais

---

## 📊 **Estatísticas do Projeto**

- **Segurança:** ✅ Rate Limiting + Helmet + CORS + Validação
- **Performance:** ✅ Serverless + Otimizações CSS/JS
- **Responsividade:** ✅ Mobile-first + Touch-friendly
- **UX/UI:** ✅ Glassmorphism + Dual Theme + Animações
- **Código:** ✅ ES6+ + Modular + Escalável
- **Acessibilidade:** ✅ Semantic HTML + ARIA + Keyboard Navigation

---

## ⚖️ **Licença**

Todos os direitos reservados. © 2024 Mateus Teixeira

**Para uso interno da SENGE-MG**

---

## 📸 **Preview do Sistema**

### 🎨 **Interface Dark Theme:**
```
🌙 Sistema Online                    ← Status Indicator
┌─────────────────────────────────┐
│ LOGO      SENGE‑MG               │ ← Header
│           Consulta CPF/CNPJ      │
├─────────────────────────────────┤
│ 🌐 API Pública    [Consultar]   │ ← Form
│ ⬇️ Select aparece só no modo CPF │
├─────────────────────────────────┤
│ Campo1 │ Campo2                  │ ← Results Grid
│ Campo3 │ Campo4                  │
└─────────────────────────────────┘
Interface interna | Mateus Teixeira ← Footer com link Instagram
```

### ☀️ **Interface Light Theme:**
- Mesma estrutura com cores claras
- Fundo branco/cinza claro
- Textos escuros para melhor legibilidade
- Glassmorphism adaptado para tema claro

---

<div align="center">
  
  <strong>🚀 Sistema desenvolvido com qualidade e segurança profissional</strong>
  
  <br>
  
  <em>Se precisa de algo similar, entre em contato!</em>
  
  <br><br>
  
  *Made with ❤️ by Mateus Teixeira*
  
</div>