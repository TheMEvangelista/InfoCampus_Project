# Relatório de implementação — P1.1 Pesquisa global

**Data:** 16/10/2026  
**Repositório:** `TheMEvangelista/InfoCampus_Project`  
**Branch:** `main`  
**Escopo:** implementação do tópico P1.1 do roadmap, sem executar build (a pedido do responsável pelo projeto).

## Entregas

### 1. Rota dedicada e parâmetros validados
- Criada `src/routes/buscar.tsx`, rota `/buscar`.
- Os parâmetros `q` (termo), `tipo` (categoria) e `pagina` (paginação) são validados e normalizados.
- O termo é limitado a 100 caracteres, espaços repetidos são normalizados e páginas inválidas retornam à primeira página.
- A URL preserva o estado da pesquisa, permitindo compartilhar, atualizar ou voltar à consulta.

### 2. Pesquisa real no Supabase
- Criada `src/lib/search.ts`.
- A pesquisa é feita diretamente nas tabelas do banco, com `range`, `count: "exact"` e tamanho de página de 12 resultados.
- **Notícias e artigos:** título, subtítulo, conteúdo e correspondência exata de tags; somente artigos publicados.
- **Pessoas:** nome completo, nome de usuário e biografia.
- **Comunidades:** nome e descrição.
- São aplicados limites e normalização no termo antes de consultar.
- As consultas não carregam todos os registros no cliente para aplicar filtros.
- As regras de visibilidade continuam dependendo das políticas RLS existentes.

### 3. Interface e navegação
- Criado `src/components/SearchPage.tsx`.
- Formulário de pesquisa com botão de limpar.
- Alternância entre notícias/artigos, pessoas e comunidades.
- Contagem por categoria, resultados clicáveis, estado vazio, carregamento, erro e opção de tentar novamente.
- Navegação entre páginas anterior/próxima com preservação do termo e da categoria.
- Artigos direcionam para suas páginas e pessoas para perfis. Como ainda não existe rota de detalhe de comunidade, resultados de comunidades direcionam à listagem geral; a integração com página específica depende do módulo de comunidades do roadmap.

### 4. Pesquisa no cabeçalho e celular
- Alterado `src/components/AppShell.tsx`.
- O formulário do cabeçalho passou a navegar para `/buscar` em vez de `/noticias`.
- Adicionado botão para abrir o formulário de pesquisa em telas pequenas, onde antes o campo ficava oculto.
- O cabeçalho e a busca mobile encaminham o termo para a mesma rota, garantindo consistência.

## Arquivos alterados

| Arquivo | Ação |
|---|---|
| `src/lib/search.ts` | Criado |
| `src/components/SearchPage.tsx` | Criado |
| `src/routes/buscar.tsx` | Criado |
| `src/components/AppShell.tsx` | Modificado |

## Critérios do P1.1

| Critério | Resultado |
|---|---|
| Interpretar e validar `q` | Implementado |
| Buscar título, subtítulo, conteúdo e tags | Implementado; tags com correspondência exata |
| Incluir pessoas e comunidades | Implementado |
| Contagem, vazio, limpeza, carregamento | Implementado |
| Pesquisa no mobile | Implementado |
| Paginação sem carregar tudo em memória | Implementado |
| URL compartilhável | Implementado |
| Build e testes em navegador | **Não executados** |

## Validação pendente e riscos

1. **Build e TypeScript:** executar `npm run build` e `npm run lint` localmente.
2. **Consulta de tags:** testar com tags simples, espaços e caracteres especiais; o filtro PostgREST para array requer validação em ambiente real.
3. **Busca com acentos:** `ilike` é insensível a maiúsculas/minúsculas, mas não necessariamente a acentos; caso necessário, avaliar normalização/indexação específica.
4. **Pesquisa por termos múltiplos:** o filtro busca a expressão informada; pesquisa por palavras separadas e ranking de relevância podem ser evolução futura.
5. **Comunidades:** não há página de detalhe para abrir diretamente o resultado; depende do tópico P2.1.
6. **Performance em escala:** `ilike '%termo%'` pode exigir índices trigram (`pg_trgm`) e avaliação de planos de consulta quando o banco crescer.
7. **Verificação de RLS:** confirmar quais perfis e comunidades podem aparecer para usuários anônimos e autenticados.

## Como testar manualmente

1. Abra `/buscar?q=exemplo&tipo=artigos&pagina=1`.
2. Pesquise palavras presentes no título, subtítulo, corpo e tags de um artigo publicado.
3. Troque para Pessoas e Comunidades; confirme os resultados e links.
4. Teste um termo inexistente e confira a mensagem de nenhum resultado.
5. Teste páginas com mais de 12 resultados e navegue entre elas.
6. Atualize a página e confirme a preservação dos filtros.
7. Em largura de celular, abra o ícone de busca do cabeçalho e faça uma pesquisa.
8. Simule erro de conexão e confira a mensagem e o botão “Tentar novamente”.

**Nota:** implementação enviada ao GitHub, sem alegação de build/testes aprovados.
