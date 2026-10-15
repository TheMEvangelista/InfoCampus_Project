# Roadmap de funcionalidades — InfoCampus

> Levantamento do código e do schema Supabase consultados em 15/10/2026. Este documento é uma auditoria estática: identifica o que está implementado, parcialmente implementado ou ausente no código analisado. Não substitui testes manuais, validação de políticas RLS nem confirmação de requisitos do produto.

## Como priorizar

- **P0 — bloqueador:** segurança, integridade dos dados ou fluxo essencial que pode falhar silenciosamente.
- **P1 — alta:** funcionalidade central para uma experiência utilizável.
- **P2 — média:** completar fluxos existentes e melhorar descoberta/gestão.
- **P3 — evolução:** melhorias de produto após estabilizar o núcleo.

## Resumo executivo

O projeto já tem uma base funcional em React/TanStack, componentes shadcn/ui, Supabase Auth e tabelas com RLS habilitado. Existem telas para publicações, artigos, comunidades, mensagens, notificações, perfil, configurações e moderação. Entretanto, várias tabelas do banco ainda não possuem um fluxo correspondente na interface, e algumas telas exibem ações ou capacidades incompletas.

Principais lacunas encontradas:

1. Pesquisa global aparenta navegar para notícias, mas não aplica o termo como filtro na listagem.
2. Mensagens não formam uma experiência completa de conversas e não atualizam em tempo real.
3. Seguir usuários, curtir/salvar artigos e denunciar conteúdo possuem suporte no banco, mas não estão conectados à interface.
4. Comunidades não têm página própria nem fluxos para criar/administrar comunidades e publicações dentro delas.
5. O painel administrativo trata principalmente da revisão de artigos; eventos, oportunidades, denúncias e gestão de usuários não têm fluxos equivalentes.
6. Recuperação de senha envia o e-mail, mas o fluxo visível para definir uma nova senha precisa ser completado/verificado.
7. Há estilos locais e elementos nativos fora do padrão visual compartilhado, inclusive um `<select>` HTML cru no formulário de artigo.
8. Termos e privacidade são textos introdutórios genéricos e precisam ser revisados antes de uso real.

## P0 — Segurança e integridade antes de ampliar funcionalidades

### [ ] P0.1 Revisar funções privilegiadas do Supabase

**Evidência:** os advisors do projeto reportaram que `public.is_admin()` e `public.is_staff()` são funções `SECURITY DEFINER` executáveis por `anon` e `authenticated`. Também reportaram a proteção contra senhas vazadas desativada.

**Tarefas**
- [ ] Inspecionar a implementação e as permissões de execução das funções.
- [ ] Revogar execução pública ou ajustar o desenho de acesso quando apropriado, preservando o funcionamento das políticas RLS.
- [ ] Ativar proteção contra senhas comprometidas nas configurações de Auth.
- [ ] Reexecutar os advisors e testar permissões com utilizador anônimo, usuário comum, editor e administrador.

**Critério de aceite:** funções privilegiadas só podem ser invocadas conforme a política planejada; operações administrativas continuam protegidas no banco, não apenas ocultas na interface.

### [ ] P0.2 Padronizar tratamento de erros e estados de carregamento

Há consultas em componentes que ignoram o campo `error` ou não apresentam estados de carregamento/erro consistentes. Isso pode fazer falhas parecerem listas vazias ou ações concluídas.

- [ ] Criar estados compartilhados de carregamento, erro, vazio e tentar novamente.
- [ ] Conferir cada mutação antes de mostrar sucesso.
- [ ] Evitar descartar erros de leitura e escrita do Supabase.
- [ ] Invalidar as chaves corretas do TanStack Query depois de cada mutação.

**Critério de aceite:** erro de rede/permissão é distinguível de “nenhum resultado”, e nenhuma ação informa sucesso se a operação falhou.

## P1 — Funcionalidades centrais

### [ ] P1.1 Completar pesquisa global

**Evidência:** a busca no cabeçalho navega para `/noticias` com um parâmetro `q`, mas a listagem observada não aplica esse parâmetro aos resultados.

- [ ] Interpretar e validar `q` na rota de listagem.
- [ ] Pesquisar artigos/notícias por título, subtítulo, conteúdo e tags.
- [ ] Ampliar para pessoas e comunidades, ou indicar claramente os tipos pesquisados.
- [ ] Mostrar contagem, estado sem resultados, limpeza do termo e feedback de carregamento.
- [ ] Tornar a busca acessível em telas pequenas; no cabeçalho atual, o campo é ocultado em larguras menores.
- [ ] Definir paginação/limites para não carregar todo o conteúdo em memória.

**Critério de aceite:** pesquisar um termo retorna resultados correspondentes e a URL permite compartilhar/recarregar a pesquisa.

### [ ] P1.2 Completar mensagens privadas

**Evidência:** a tela atual permite enviar mensagem por nome de usuário e lista mensagens enviadas/recebidas; não há interface de conversas agrupadas nem leitura/atualização em tempo real.

- [ ] Agrupar mensagens por conversa e mostrar o nome/avatar da outra pessoa.
- [ ] Abrir uma conversa específica e ordenar mensagens cronologicamente.
- [ ] Adicionar atualização em tempo real via Supabase Realtime ou estratégia de atualização controlada.
- [ ] Implementar estado de lida/não lida usando a coluna `messages.read`.
- [ ] Exibir prévia e horário da última mensagem na lista de conversas.
- [ ] Permitir iniciar conversa a partir do perfil do usuário.
- [ ] Tratar carregamento, falha de envio, repetição e estado vazio.
- [ ] Validar limites de frequência e tamanho no cliente e no banco.

**Critério de aceite:** mensagens ficam agrupadas corretamente por interlocutor, a conversa atualiza sem recarregar a página e as permissões impedem leitura por terceiros.

### [ ] P1.3 Implementar seguir/deixar de seguir usuários

**Evidência:** a tabela `follows` existe, mas não foi encontrado fluxo correspondente na interface.

- [ ] Adicionar botão “Seguir/Seguindo” no perfil público.
- [ ] Mostrar contagem e listas de seguidores/seguindo.
- [ ] Bloquear seguir a si próprio e impedir duplicidade.
- [ ] Atualizar estado e contagens após a ação.
- [ ] Definir políticas RLS para leitura e escrita de relações.
- [ ] Decidir se o feed inicial deve priorizar pessoas seguidas.

**Critério de aceite:** relação persiste após recarregar e só pode ser criada/removida pelo usuário autenticado correspondente.

### [ ] P1.4 Completar ações sociais de publicações

**Evidência:** publicações permitem curtir, comentar, salvar e compartilhar o URL atual; o menu de reticências é apenas um ícone sem ação.

- [ ] Conectar o menu a ações reais: editar/excluir publicação própria e denunciar publicação de terceiros.
- [ ] Pedir confirmação antes de excluir e atualizar o feed após a operação.
- [ ] Fazer o botão compartilhar copiar o link específico da publicação, não apenas `window.location.href`.
- [ ] Corrigir a atualização da contagem de comentários depois de criar um comentário.
- [ ] Adicionar paginação ou “carregar mais” ao feed, hoje limitado a 40 publicações.
- [ ] Definir regras para editar/excluir comentários próprios.
- [ ] Mostrar erros e estados de operação em todas as ações.

**Critério de aceite:** cada ícone interativo executa a ação indicada e as contagens/estados refletem o banco.

### [ ] P1.5 Implementar curtidas e itens salvos para artigos

**Evidência:** `article_likes` existe no banco, mas não foi encontrado fluxo de curtida para artigos. O salvamento de conteúdo implementado em `PostCard` cobre publicações, não artigos.

- [ ] Adicionar curtir/descurtir em artigo e mostrar contagem.
- [ ] Permitir salvar/remover artigos da lista pessoal.
- [ ] Criar uma página “Itens salvos” para publicações e artigos.
- [ ] Tratar item removido ou sem permissão sem quebrar a lista.
- [ ] Definir políticas RLS e chaves de consulta específicas por usuário.

**Critério de aceite:** curtidas e itens salvos persistem, são privados quando necessário e a lista reúne os dois tipos de conteúdo.

### [ ] P1.6 Corrigir e completar autenticação

- [ ] Verificar o fluxo completo de recuperação: abrir o link recebido, validar sessão de recuperação e exibir formulário para definir nova senha.
- [ ] Confirmar que a rota de redirecionamento de recuperação não termina simplesmente na tela de login.
- [ ] Tratar confirmação de e-mail, link expirado e erros de sessão.
- [ ] Evitar executar navegação imperativa durante a renderização da tela de login; mover o redirecionamento para um efeito ou mecanismo de rota.
- [ ] Garantir que estados de carregamento impeçam submissões duplicadas e que falhas de rede não deixem o formulário preso.
- [ ] Testar criação, confirmação, login, logout, recuperação e alteração de senha de ponta a ponta.

**Critério de aceite:** o usuário consegue redefinir a senha com o link recebido e entrar usando a nova senha.

### [ ] P1.7 Completar edição do perfil

**Evidência:** as configurações atuais editam nome, biografia e URL do avatar. O perfil também tem o campo `links`, mas ele não é editável pela tela observada.

- [ ] Adicionar edição e validação de links externos.
- [ ] Permitir upload de avatar em Supabase Storage, com política de acesso e limites de tamanho/formato, em vez de exigir somente URL externa.
- [ ] Atualizar o perfil público e o cabeçalho imediatamente após salvar.
- [ ] Adicionar feedback de validação, cancelamento e erro.
- [ ] Definir um fluxo de exclusão/encerramento de conta, incluindo tratamento dos dados associados.

**Critério de aceite:** alterações ficam persistidas e refletidas em todas as telas sem exigir novo login.

## P2 — Completar módulos já existentes

### [ ] P2.1 Comunidades

**Evidência:** a listagem mostra comunidades e permite entrar/sair. Não há rota de detalhe de comunidade identificada nem fluxo de criação/gestão; o feed de publicações não está integrado a uma página de comunidade.

- [ ] Criar rota de detalhe com descrição, membros e publicações da comunidade.
- [ ] Filtrar publicações por `community_id`.
- [ ] Permitir criar publicação dentro de uma comunidade.
- [ ] Implementar criação e edição de comunidades com regras de autorização.
- [ ] Definir papéis de moderador/administrador de comunidade e ações de gestão de membros.
- [ ] Corrigir a atualização otimista/local do botão de participação e evitar estado duplicado.
- [ ] Definir regras para sair de comunidade e para o último administrador/membro.
- [ ] Adicionar busca e filtros de comunidades.

**Critério de aceite:** entrar/sair e publicar dentro de uma comunidade atualiza o estado de forma consistente e respeita RLS.

### [ ] P2.2 Eventos

**Evidência:** eventos são listados, mas não há fluxo de criação/edição/remoção nem interação de inscrição visível. A tabela atual tem título, resumo, local, data/hora e criador.

- [ ] Criar interface de gestão de eventos para papéis autorizados.
- [ ] Criar página de detalhes do evento.
- [ ] Adicionar inscrição/interesse, cancelamento e contagem de participantes, caso isso faça parte do escopo.
- [ ] Adicionar filtros por data, próximos eventos e eventos passados.
- [ ] Validar data/hora, fuso horário, campos obrigatórios e links.
- [ ] Definir notificações de novos eventos e lembretes, se desejado.

**Critério de aceite:** equipe autorizada consegue gerir eventos e usuários conseguem consultar detalhes e interagir conforme as regras definidas.

### [ ] P2.3 Oportunidades

**Evidência:** oportunidades são somente listadas e a tabela já contém tipo, descrição, prazo, link e autor.

- [ ] Criar/editar/arquivar oportunidades para papéis autorizados.
- [ ] Adicionar página de detalhes, filtros por tipo e prazo.
- [ ] Destacar oportunidades vencidas e validar links externos.
- [ ] Permitir salvar oportunidades ou marcar interesse, se desejado.
- [ ] Definir revisão/moderação e regras de expiração.

**Critério de aceite:** oportunidades podem ser mantidas atualizadas sem intervenção manual no banco.

### [ ] P2.4 Artigos: ciclo editorial completo

**Evidência:** há formulário de envio e aprovação/rejeição por equipe; artigos são texto simples, tags existem no schema mas não são preenchidas pelo formulário, e não há edição de artigo já enviado/publicado.

- [ ] Implementar rascunho, edição, pré-visualização e publicação.
- [ ] Permitir autor editar seus próprios artigos respeitando o estado editorial.
- [ ] Adicionar edição de tags e interface de seleção de categoria padronizada.
- [ ] Considerar editor de conteúdo com formatação acessível, links e imagens.
- [ ] Mostrar status “rascunho”, “em revisão”, “publicado” e “rejeitado” ao autor.
- [ ] Guardar feedback de moderação em vez de excluir imediatamente um artigo rejeitado.
- [ ] Adicionar curtidas, salvamento e compartilhamento específico do artigo.
- [ ] Tratar artigos não encontrados, erro de carregamento e comentários sem perfil disponível.

**Critério de aceite:** autor e equipe conseguem acompanhar todo o ciclo de vida do artigo sem edição manual no banco.

### [ ] P2.5 Notificações

**Evidência:** a tela lista notificações e permite marcar uma por uma como lida. A coluna `link` existe, mas não é usada na listagem observada.

- [ ] Tornar a notificação clicável e navegar para o destino guardado em `link`.
- [ ] Adicionar “Marcar todas como lidas”.
- [ ] Adicionar paginação/“carregar mais” e atualização em tempo real ou polling controlado.
- [ ] Conferir quais eventos geram notificações e se os triggers cobrem curtidas, comentários, mensagens e moderação.
- [ ] Exibir estados de erro e atualizar corretamente o contador do cabeçalho.
- [ ] Adicionar preferências de notificação, caso façam parte do escopo.

**Critério de aceite:** notificações têm destino útil, estado de leitura confiável e contagem sincronizada.

### [ ] P2.6 Painel administrativo e moderação

**Evidência:** o painel tem contagens e revisão de artigos pendentes; não foram encontrados fluxos de interface para gerenciar eventos, oportunidades, comunidades, usuários ou denúncias. A tabela `reports` existe, mas não foi encontrada conectada à interface.

- [ ] Criar fila de denúncias com motivo, item denunciado, estado e histórico de resolução.
- [ ] Permitir ações de moderação para posts/comentários e registrar o motivo.
- [ ] Gerir artigos, eventos, oportunidades e comunidades.
- [ ] Gerir papéis de usuário somente para administradores, com confirmação e trilha de auditoria.
- [ ] Adicionar filtros, paginação e busca no painel.
- [ ] Diferenciar permissões de admin e editor na interface e, principalmente, no banco.
- [ ] Evitar exclusão irreversível como único mecanismo de rejeição; considerar arquivamento/status.
- [ ] Exibir erros de permissão e de carregamento sem confundir com fila vazia.

**Critério de aceite:** cada ação administrativa é autorizada pelo banco, auditável e disponível apenas aos papéis correspondentes.

### [ ] P2.7 Denúncias, bloqueio e segurança comunitária

- [ ] Implementar ação “Denunciar” para publicações, comentários, artigos e perfis.
- [ ] Usar a tabela `reports` com validação de tipo, motivo e estado.
- [ ] Evitar denúncias duplicadas ou abusivas e limitar frequência.
- [ ] Definir processo de triagem, resolução e retenção de registros.
- [ ] Avaliar bloqueio/mute de usuários e como isso afeta mensagens e feed.

**Critério de aceite:** uma denúncia é registrada de forma segura e aparece na fila de moderação.

### [ ] P2.8 Perfil público e descoberta

- [ ] Adicionar seguir/deixar de seguir e contagens de seguidores/seguindo.
- [ ] Adicionar abas para publicações, artigos e itens salvos privados.
- [ ] Exibir estado de carregamento e erro; hoje a ausência inicial de dados pode ser confundida com perfil inexistente.
- [ ] Adicionar paginação para publicações/artigos do perfil.
- [ ] Permitir abrir mensagem a partir do perfil.
- [ ] Definir visibilidade de perfil e links externos.

### [ ] P2.9 Termos e privacidade

**Evidência:** as páginas legais contêm apenas dois parágrafos genéricos e não descrevem de forma completa coleta, finalidade, retenção, direitos, canais de contato, cookies/telemetria ou processo de exclusão.

- [ ] Redigir termos de uso completos e específicos do produto.
- [ ] Redigir política de privacidade alinhada ao tratamento de dados efetivamente realizado e à legislação aplicável.
- [ ] Explicar visibilidade de perfis, publicações, mensagens e registros de moderação.
- [ ] Informar canal real de contato e processo de solicitação de acesso/correção/exclusão.
- [ ] Revisar com pessoa responsável por privacidade/jurídico antes de produção.

**Critério de aceite:** conteúdo revisado e coerente com a implementação real; não publicar promessas que o sistema ainda não cumpre.

## P2 — Padronização visual e de interação após as mudanças recentes

Os componentes compartilhados de shadcn/ui foram ajustados, mas algumas telas ainda usam estilos próprios ou elementos HTML nativos. A padronização precisa chegar às páginas, não apenas aos componentes-base.

### [ ] P2.10 Substituir controles nativos e estilos duplicados

- [ ] Em `src/components/CampusPages.tsx`, substituir o `<select>` nativo do formulário de artigo pelo componente compartilhado `Select` (Radix/shadcn).
- [ ] Padronizar raio de borda, sombras, espaçamentos e hover em `ArticleCard`, `PostCard`, `CommunityTile`, `OpportunityTile` e `EventRow`.
- [ ] Revisar `rounded-md`, `shadow-card` e cores explícitas em telas que não seguem os tokens compartilhados.
- [ ] Padronizar campos de formulário com `Label`, `Input`, `Textarea`, `Select` e os componentes `Form`/React Hook Form quando houver validação mais complexa.
- [ ] Usar variantes padronizadas de `Button` em vez de botões HTML com classes próprias quando houver ação equivalente.
- [ ] Conferir estados de foco, erro, desabilitado, carregamento e sucesso em todos os formulários.
- [ ] Conferir responsividade, alvos de toque e navegação por teclado em telas pequenas.

**Critério de aceite:** não há diferenças arbitrárias de estilo entre telas para ações e controles equivalentes; exceções visuais são intencionais.

### [ ] P2.11 Consistência de feedback

- [ ] Padronizar textos de sucesso/erro em português e mensagens que expliquem como corrigir o problema.
- [ ] Usar confirmação em ações destrutivas.
- [ ] Desabilitar botões durante operações assíncronas e evitar envios duplicados.
- [ ] Mostrar estados vazios específicos por módulo, em vez de uma mensagem genérica em todos os casos.
- [ ] Assegurar contraste e rótulos acessíveis em botões somente com ícone.

## P3 — Evolução e qualidade de produto

### [ ] P3.1 Uploads e gestão de mídia
- [ ] Configurar buckets e políticas de Storage para avatares, capas e mídias.
- [ ] Validar tipo/tamanho, mostrar progresso e permitir remover/substituir arquivos.
- [ ] Criar pré-visualização e fallbacks para links de mídia inválidos.

### [ ] P3.2 Feed mais relevante
- [ ] Ordenação por recentes e/ou relevância.
- [ ] Filtros por categoria, comunidade e tipo de conteúdo.
- [ ] Paginação/infinite scroll com tratamento de duplicidade.
- [ ] Evitar consultas N+1 e limitar dados carregados por cartão.

### [ ] P3.3 Testes automatizados
- [ ] Adicionar testes unitários para validação, utilitários e regras de apresentação.
- [ ] Adicionar testes de integração para Auth, políticas de acesso e mutações Supabase.
- [ ] Adicionar testes de ponta a ponta para cadastro, login, recuperação de senha, publicação, comentários, comunidades, mensagens e moderação.
- [ ] Cobrir estados sem dados, erros de rede e permissões insuficientes.
- [ ] Criar checklist de regressão visual para desktop e mobile.

### [ ] P3.4 Observabilidade e manutenção
- [ ] Registrar erros de frontend sem expor conteúdo privado ou tokens.
- [ ] Definir métricas para falhas de envio, consultas e operações de moderação.
- [ ] Documentar configuração local, variáveis de ambiente, migrations e papéis de usuário.
- [ ] Revisar limites, índices e consultas conforme o volume real crescer.

## Dependências já existentes no banco que devem ser aproveitadas

O schema público já contém tabelas para:

- `profiles`, `user_roles`, `categories`, `articles`
- `communities`, `community_members`, `posts`, `comments`
- `article_likes`, `post_likes`, `saved_items`, `follows`
- `events`, `opportunities`, `messages`, `notifications`, `reports`

Todas as tabelas públicas consultadas aparecem com RLS habilitado. Isso, isoladamente, **não comprova que cada política esteja correta**: cada nova funcionalidade deve incluir testes de autorização para leitura, inserção, atualização e exclusão.

## Ordem recomendada de execução

1. **Segurança e confiabilidade:** P0.1 e P0.2.
2. **Fluxos essenciais:** pesquisa, autenticação/recuperação, mensagens e perfil.
3. **Interações sociais:** seguir, curtidas de artigos, itens salvos, edição/exclusão e denúncias.
4. **Módulos de conteúdo:** páginas de comunidade, gestão de eventos/oportunidades e ciclo editorial.
5. **Moderação e notificações:** completar painel, links e estados de leitura.
6. **Padronização visual:** aplicar os componentes shadcn/ui compartilhados nas telas existentes.
7. **Políticas legais, testes e observabilidade:** antes de considerar a plataforma pronta para uso amplo.

## Observações sobre o escopo

- “Não encontrado no código analisado” significa que o fluxo não apareceu nas telas/componentes consultados; não é prova absoluta de que não exista em outra branch ou serviço externo.
- O projeto tem schema e interface para vários módulos, mas a presença de uma tabela ou rota não significa que o fluxo esteja completo.
- O levantamento não executou build ou testes, conforme solicitado; a validação de compilação e regressão fica para execução local.
