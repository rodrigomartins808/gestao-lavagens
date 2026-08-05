# 🚗 Sistema de Gestão e Fidelização - Posto de Lavagem

Uma plataforma web completa para a gestão de um posto de lavagem automóvel. Desenvolvida à medida para digitalizar o negócio, abandonar os clássicos cartões de papel e centralizar toda a operação, desde o registo de clientes até à faturação mensal.

## 🌟 Funcionalidades Principais

O sistema está dividido em três portais distintos, cada um adaptado às necessidades do seu utilizador:

### 👨‍💼 Portal da Administração (Admin Dashboard)
- **Métricas em Tempo Real:** Visão global sobre a faturação do dia, faturação do mês, total de clientes novos e total de lavagens.
- **Gestão de Clientes e Viaturas:** Criação e edição de fichas de clientes com múltiplas viaturas (matrícula, marca, modelo e cor).
- **Exportação de Dados (Excel):** Exportação de faturação mensal com somatório final, histórico de clientes inativos, campanhas e visão geral de negócio, num formato pronto a usar na contabilidade.
- **Campanhas de Marketing:** Criação e envio de campanhas promocionais para todos os clientes ativos via integração (preparada) para WhatsApp/SMS.
- **Histórico Completo:** Acesso ao percurso vitalício de cada cliente e valor total gerado (Lifetime Value).

### 👷 Portal do Funcionário (Employee Dashboard)
- **Interface Otimizada:** Teclado numérico gigante e adaptado a ecrãs táteis, permitindo logins super-rápidos e uma operação sem fricções.
- **Pesquisa Inteligente (Quick Search):** Pesquisa instantânea por nome, telemóvel, NIF ou matrícula (lista as viaturas de cada cliente automaticamente).
- **Registo de Lavagens Express:** Botões rápidos para lavagens anónimas (exterior, interior, completa) sem necessidade de associar a cliente.
- **Atribuição de Carimbos:** Registo de lavagens associadas a clientes com contabilização automática de pontos no cartão de fidelização digital.

### 📱 Portal do Cliente (Customer Area)
- **Cartão de Fidelização Digital:** Visualização do estado atual dos "carimbos" (ex: 7/10 lavagens para oferta).
- **Acesso Simples:** Acesso via número de telemóvel (login sem password).
- **Histórico Transparente:** Consulta de todo o histórico de lavagens, veículos associados e dados pessoais.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React.js, Vite, Lucide Icons, SheetJS (para exportação Excel).
- **Backend e Base de Dados:** Supabase (PostgreSQL), para uma sincronização em tempo real e base de dados relacional.
- **Alojamento:** Vercel (Preparado para CD/CI).

## 🚀 Instalação Local (Para Desenvolvimento)

1. Clone o repositório:
```bash
git clone https://github.com/rodrimartini808/gestao-lavagens.git
```
2. Instale as dependências:
```bash
npm install
```
3. Configure as Variáveis de Ambiente. Crie um ficheiro `.env.local` na raiz do projeto com:
```env
VITE_SUPABASE_URL=seu_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_ADMIN_PIN=9999
```
4. Inicie o servidor:
```bash
npm run dev
```

## 🔒 Segurança e Acesso
- O acesso de administrador e funcionário é feito de forma célere através de um PIN seguro (Teclado Numérico Touch).
- Os clientes têm acesso apenas aos seus próprios dados de fidelização.
