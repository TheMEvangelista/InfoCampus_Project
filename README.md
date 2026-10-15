<<<<<<< HEAD
=======

# InfoCampus 🎓

**Informação, conexão e oportunidades em um só lugar.**

O **InfoCampus** é uma plataforma educacional que centraliza informações e incentiva a interação entre estudantes e integrantes da comunidade acadêmica. O sistema reúne conteúdos, comunidades, eventos e oportunidades em um ambiente digital colaborativo, facilitando o acesso ao conhecimento e a troca de experiências.

## 🎯 Objetivo

Promover um ambiente educacional mais conectado, acessível e participativo, no qual os usuários possam se informar, compartilhar conteúdos, interagir com outras pessoas e descobrir oportunidades relevantes para sua trajetória acadêmica e profissional.

## ✨ Funcionalidades e módulos

A estrutura atual do projeto contempla os seguintes módulos:

- **Perfis de usuário:** informações pessoais, biografia, avatar e links.
- **Autenticação e permissões:** integração com Supabase Auth e papéis de acesso (`admin`, `editor`, `author` e `user`).
- **Artigos e notícias:** publicações organizadas por categorias, com tags e destaque.
- **Feed de publicações:** posts com suporte a texto e links para imagens, vídeos e páginas externas.
- **Comunidades:** espaços temáticos com participação de membros.
- **Interações sociais:** comentários, curtidas, seguidores e itens salvos.
- **Eventos educacionais:** divulgação de atividades com data e local.
- **Oportunidades:** estágios, empregos, bolsas, pesquisa e monitoria.
- **Mensagens e notificações:** recursos para comunicação entre usuários.
- **Moderação:** registro de denúncias de conteúdos.

> **Nota:** os módulos acima foram identificados na estrutura do banco de dados. A existência de uma tabela não significa, por si só, que toda a interface ou o fluxo correspondente esteja finalizado.

## 🛠️ Tecnologias

| Camada                  | Tecnologias                     |
| ----------------------- | ------------------------------- |
| Interface               | React 19, TypeScript            |
| Aplicação e rotas       | TanStack Start, TanStack Router |
| Estilização             | Tailwind CSS 4, Radix UI        |
| Dados e estado          | TanStack Query                  |
| Formulários e validação | React Hook Form, Zod            |
| Backend                 | Supabase                        |
| Banco de dados          | PostgreSQL 17                   |
| Build e desenvolvimento | Vite                            |

## 🏗️ Arquitetura geral

```text
Usuário
   │
   ▼
Aplicação web (React + TanStack Start)
   │
   ▼
Supabase
   ├── Auth: autenticação de usuários
   └── PostgreSQL: dados da plataforma
        ├── Perfis e permissões
        ├── Artigos, categorias e posts
        ├── Comunidades e interações
        ├── Eventos e oportunidades
        └── Mensagens, notificações e denúncias
```

O banco utiliza chaves estrangeiras para relacionar os módulos e **Row Level Security (RLS)** nas tabelas do schema público. As políticas de acesso devem ser verificadas durante a evolução do sistema.

## 🗃️ Estrutura de dados

O schema `public` possui **17 tabelas**:

| Domínio                 | Tabelas                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| Usuários e relações     | `profiles`, `user_roles`, `follows`                                          |
| Conteúdo e interações   | `articles`, `categories`, `posts`, `comments`, `article_likes`, `post_likes` |
| Comunidades             | `communities`, `community_members`                                           |
| Recursos educacionais   | `events`, `opportunities`                                                    |
| Comunicação             | `messages`, `notifications`                                                  |
| Organização e moderação | `saved_items`, `reports`                                                     |

As migrações registradas no banco estão organizadas em quatro etapas: schema, funções e triggers, RLS e permissões, e notificações.

## 🚀 Executando localmente

**Pré-requisitos:** Node.js e um gerenciador de pacotes compatível com o projeto.

1. Clone o repositório:

   ```bash
   git clone https://github.com/TheMEvangelista/InfoCampus_Project.git
   cd InfoCampus_Project
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente exigidas pela integração com Supabase. Consulte o código de inicialização do cliente para identificar os nomes exatos das variáveis. **Não publique chaves privadas ou credenciais administrativas.**

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

### Scripts disponíveis

| Comando             | Finalidade                               |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Inicia o ambiente de desenvolvimento     |
| `npm run build`     | Gera a versão de produção                |
| `npm run build:dev` | Executa build em modo de desenvolvimento |
| `npm run preview`   | Pré-visualiza o build                    |
| `npm run lint`      | Executa a análise estática com ESLint    |
| `npm run format`    | Formata o código com Prettier            |

## 🔐 Segurança

- As 17 tabelas públicas identificadas possuem RLS habilitado.
- O banco possui relacionamentos e restrições de integridade.
- Papéis de acesso estão previstos no modelo de dados.
- Políticas RLS, permissões e fluxos de autenticação precisam ser testados antes de um lançamento em produção.
- Nunca armazene segredos ou chaves administrativas no frontend.

## 📌 Estado do projeto

O InfoCampus possui uma base técnica e um modelo de dados estruturados para funcionalidades educacionais e sociais. A implementação completa das telas, a integração ponta a ponta, os testes e o deploy devem ser avaliados separadamente.

## 🌱 Visão

Construir um espaço digital que aproxime pessoas, conhecimento e oportunidades, tornando a experiência educacional mais conectada, colaborativa e acessível.

---

**InfoCampus — conectando conhecimento, pessoas e oportunidades.**

> > > > > > > 3b9577034bb42c502b4cd3a3a1faf72782fbfad3
