# 💸 Dividi - Gastos Compartilhados Premium

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwind%20css-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

O **Dividi** é uma aplicação de controle financeiro focada em casais e pessoas que compartilham gastos domésticos. Com um design "Dark Premium" e foco em experiência do usuário, ele transforma a tarefa chata de anotar gastos em algo rápido, seguro e visualmente agradável.

---

## ✨ Funcionalidades Principais

- 🛡️ **Autenticação de Segurança Avançada**: Sistema de login robusto com validação de senha, confirmação de cadastro e recuperação de conta.
- 📊 **Dashboard Dinâmico**: Visão clara dos gastos mensais e semanais com cálculos automáticos de saldo restante.
- 🌍 **Suporte Multi-Moedas**: Escolha entre Real (R$), Euro (€) ou Dólar (US$) nas configurações.
- 📂 **Importação de Planilhas**: Migre seus dados do Excel ou Google Sheets (CSV/XLSX) com um sistema de validação inteligente.
- 📱 **Interface Adaptável**: Design responsivo com efeitos de *glassmorphism* e animações fluidas.
- 🤝 **Compartilhamento em Tempo Real**: Convide seu parceiro(a) para visualizar e editar os mesmos gastos.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router & Turbopack)
- **Banco de Dados & Auth**: [Supabase](https://supabase.com/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Processamento de Dados**: [PapaParse](https://www.papaparse.com/) & [SheetJS (XLSX)](https://sheetjs.com/)

---

## 🚀 Como Começar

### 1. Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.

### 2. Clonar e Instalar
```bash
git clone https://github.com/alexandra-carneiro/dividi-app.git
cd dividi-app
npm install
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz e adicione suas chaves do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 4. Executar
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔒 Segurança

O projeto utiliza **Row Level Security (RLS)** do Supabase, garantindo que:
- Cada usuário só possa ver os gastos da sua própria "casa" (household).
- As ações de alteração de limites e moeda sejam restritas aos membros autorizados.
- Dados sensíveis de autenticação sejam gerenciados pelo Supabase Auth com criptografia de ponta.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

> Desenvolvido com ❤️ por **Alexandra Carneiro**
