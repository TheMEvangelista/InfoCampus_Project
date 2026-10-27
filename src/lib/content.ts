import { supabase } from "@/integrations/supabase/client";

export type Author = { id: string; username: string; full_name: string; avatar_url: string | null };
export type Category = { id: string; slug: string; name: string; description: string | null };
export type Article = { id: string; slug: string; title: string; subtitle: string | null; content: string; cover_url: string | null; created_at: string; featured: boolean; tags: string[]; author_id: string | null; profiles: Author | null; categories: Category | null };
export type Post = { id: string; author_id: string; community_id: string | null; content: string; image_url: string | null; link_urls: string[]; created_at: string; profiles: Author | null; communities: { name: string; slug: string } | null; post_likes: { user_id: string }[]; comments: { id: string }[] };
export type CampusEvent = { id: string; title: string; summary: string | null; location: string | null; starts_at: string };
export type Community = { id: string; slug: string; name: string; description: string | null; cover_url: string | null; community_members: { user_id: string }[] };
export type OpportunityAttachment = { name: string; url?: string };
export type Opportunity = {
  id: string;
  title: string;
  type: string;
  description: string;
  deadline: string | null;
  link: string | null;
  edital_url: string | null;
  attachment_urls: string[];
  registration_url: string | null;
  period?: string | null;
  edital_title?: string | null;
  attachments?: OpportunityAttachment[];
};

export const defaultOpportunities: Opportunity[] = [
  {
    id: "edital-prpgi-223-2026",
    title: "EDITAL PRPGI Nº 223/2026 - BOLSA DE DESENVOLVIMENTO INSTITUCIONAL",
    type: "bolsa",
    description:
      "A Pró-Reitoria de Pesquisa, Pós-Graduação e Inovação, no uso das atribuições que lhe são conferidas pelo Art. 19, inciso II, do Estatuto do Instituto Federal de Educação, Ciência e Tecnologia do Maranhão, torna público o presente edital contendo as normas para a inscrição, seleção e classificação dos candidatos à Bolsa de Desenvolvimento Institucional, vigência 2026/2027.",
    deadline: "2026-09-16",
    period: "05/08/2026 14:00:00 a 16/09/2026 23:59:59",
    edital_title: "Edital PRPGI Nº 223/2026 - Edital de Abertura",
    edital_url: "https://prpgi.ifma.edu.br/editais/edital-223-2026",
    registration_url: "https://prpgi.ifma.edu.br/inscricoes/edital-223-2026",
    attachment_urls: [
      "https://prpgi.ifma.edu.br/editais/223-2026/anexos.zip",
    ],
    attachments: [
      { name: "Edital PRPGI Nº 223/2026 - Edital de Abertura", url: "https://prpgi.ifma.edu.br/editais/edital-223-2026.pdf" },
      { name: "TODOS OS ANEXOS", url: "https://prpgi.ifma.edu.br/editais/223-2026/anexos.zip" },
      { name: "ANEXO VI - DECLARAÇÃO NEGATIVA DE VÍNCULO EMPREGATÍCIO DO BOLSISTA", url: "https://prpgi.ifma.edu.br/editais/223-2026/anexo-vi.docx" },
      { name: "ANEXO VII - TERMO DE COMPROMISSO DO BOLSISTA", url: "https://prpgi.ifma.edu.br/editais/223-2026/anexo-vii.docx" },
      { name: "ANEXO VIII - DECLARAÇÃO DE ATENDIMENTO À LEGISLAÇÃO DE ASSISTÊNCIA ESTUDANTIL", url: "https://prpgi.ifma.edu.br/editais/223-2026/anexo-viii.docx" },
    ],
    link: "https://prpgi.ifma.edu.br/editais/edital-223-2026",
  },
  {
    id: "edital-prpgi-98-2026",
    title: "EDITAL PRPGI Nº 98/2026 - INTERCÂMBIO NACIONAL",
    type: "pesquisa",
    description:
      "A Pró-Reitoria de Pesquisa, Pós-Graduação e Inovação (PRPGI), no uso das atribuições que lhe são conferidas pelo Artigo 19, inciso II, do Estatuto do Instituto Federal de Educação, Ciência e Tecnologia do Maranhão (IFMA), torna público o presente edital, de fluxo contínuo, aos interessados em submeter suas solicitações (na forma de propostas) de auxílio individual para a participação em viagens nacionais de estudos e pesquisas de natureza científica/tecnológica de curta duração.",
    deadline: "2026-09-21",
    period: "15/04/2026 16:00:00 a 21/09/2026 23:59:00",
    edital_title: "Edital de Abertura",
    edital_url: "https://prpgi.ifma.edu.br/editais/edital-98-2026",
    registration_url: "https://prpgi.ifma.edu.br/inscricoes/edital-98-2026",
    attachment_urls: [
      "https://prpgi.ifma.edu.br/editais/98-2026/anexos.zip",
    ],
    attachments: [
      { name: "Edital de Abertura", url: "https://prpgi.ifma.edu.br/editais/edital-98-2026.pdf" },
      { name: "TODOS OS ANEXOS", url: "https://prpgi.ifma.edu.br/editais/98-2026/anexos.zip" },
      { name: "ANEXO I - TERMO DE COMPROMISSO DO INTERCAMBISTA - Em formato editável", url: "https://prpgi.ifma.edu.br/editais/98-2026/anexo-i.docx" },
      { name: "ANEXO II - CARTA DE ANUÊNCIA INSTITUCIONAL - Em formato editável", url: "https://prpgi.ifma.edu.br/editais/98-2026/anexo-ii.docx" },
    ],
    link: "https://prpgi.ifma.edu.br/editais/edital-98-2026",
  },
  {
    id: "edital-prpgi-21-2026",
    title: "EDITAL PRPGI Nº 21/2026 - PIBIC ENSINO SUPERIOR 2026/2027",
    type: "pesquisa",
    description:
      "A Pró-reitoria de Pesquisa, Pós-Graduação e Inovação - PRPGI, no uso das atribuições que lhe são conferidas pelo Art. 19, II, do Estatuto do Instituto Federal de Educação, Ciência e Tecnologia do Maranhão - IFMA, torna público aos interessados o presente edital contendo as normas para a inscrição, seleção e classificação de projetos de pesquisa, com vigência no biênio 2026/2027, no âmbito do Programa Institucional de Bolsas de Iniciação Científica – PIBIC, Ensino Superior.",
    deadline: "2026-04-13",
    period: "19/01/2026 18:00:00 a 13/04/2026 23:59:00",
    edital_title: "Edital de Abertura (ES)",
    edital_url: "https://prpgi.ifma.edu.br/editais/edital-21-2026",
    registration_url: "https://prpgi.ifma.edu.br/inscricoes/edital-21-2026",
    attachment_urls: [
      "https://prpgi.ifma.edu.br/editais/21-2026/anexos.zip",
    ],
    attachments: [
      { name: "Edital de Abertura (ES)", url: "https://prpgi.ifma.edu.br/editais/edital-21-2026.pdf" },
      { name: "TODOS OS ANEXOS", url: "https://prpgi.ifma.edu.br/editais/21-2026/anexos.zip" },
      { name: "ANEXO XII - DECLARAÇÃO NEGATIVA DE VÍNCULO EMPREGATÍCIO DO BOLSISTA - Em formato editável", url: "https://prpgi.ifma.edu.br/editais/21-2026/anexo-xii.docx" },
      { name: "ANEXO XIII - TERMO DE COMPROMISSO DO BOLSISTA - Em formato editável", url: "https://prpgi.ifma.edu.br/editais/21-2026/anexo-xiii.docx" },
      { name: "ANEXO XIV - FORMULÁRIO PARA INCLUSÃO DE COLABORADOR EXTERNO - Em formato editável", url: "https://prpgi.ifma.edu.br/editais/21-2026/anexo-xiv.docx" },
      { name: "ANEXO XV - DECLARAÇÃO DE QUE DESEJA CONCORRER ÀS COTAS DO AUXÍLIO FINANCEIRO - Em formato editável", url: "https://prpgi.ifma.edu.br/editais/21-2026/anexo-xv.docx" },
      { name: "DECLARAÇÃO - BOLSISTA COTA IFMA", url: "https://prpgi.ifma.edu.br/editais/21-2026/declaracao-cota.docx" },
    ],
    link: "https://prpgi.ifma.edu.br/editais/edital-21-2026",
  },
  {
    id: "dev-junior-saoluis",
    title: "Desenvolvedor(a) júnior",
    type: "emprego",
    description: "Vaga CLT em empresa de software de São Luís. Conhecimentos em React e Node.",
    deadline: "2026-10-23",
    link: "https://infocampus.lovable.app/oportunidades",
    edital_url: null,
    attachment_urls: [],
    registration_url: null,
  },
  {
    id: "pesquisa-energia-solar",
    title: "Pesquisa em energias renováveis",
    type: "pesquisa",
    description: "Grupo de pesquisa busca estudantes para projeto de energia solar.",
    deadline: "2026-10-18",
    link: "https://infocampus.lovable.app/oportunidades",
    edital_url: null,
    attachment_urls: [],
    registration_url: null,
  },
  {
    id: "estagio-suporte-redes",
    title: "Estágio em suporte de redes",
    type: "estagio",
    description: "Estágio de 30h semanais no setor de TI do campus.",
    deadline: "2026-10-10",
    link: "https://infocampus.lovable.app/oportunidades",
    edital_url: null,
    attachment_urls: [],
    registration_url: null,
  },
  {
    id: "estagio-dev-web",
    title: "Estágio em desenvolvimento web",
    type: "estagio",
    description: "Vaga de estágio para estudantes a partir do 4º período. 20h semanais, bolsa + auxílio transporte.",
    deadline: "2026-10-24",
    link: "https://infocampus.lovable.app/oportunidades",
    edital_url: null,
    attachment_urls: [],
    registration_url: null,
  },
  {
    id: "bolsa-ic-ia",
    title: "Bolsa de Iniciação científica em IA",
    type: "bolsa",
    description: "Projeto de pesquisa sobre visão computacional aplicada à agricultura.",
    deadline: "2026-11-15",
    link: "https://infocampus.lovable.app/oportunidades",
    edital_url: null,
    attachment_urls: [],
    registration_url: null,
  },
  {
    id: "monitoria-banco-dados",
    title: "Monitoria de Banco de Dados",
    type: "monitoria",
    description: "Seleção de monitores para a disciplina de Banco de Dados.",
    deadline: "2026-10-30",
    link: "https://infocampus.lovable.app/oportunidades",
    edital_url: null,
    attachment_urls: [],
    registration_url: null,
  },
];

async function checked<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}
export const content = {
  articles: () => checked<Article[]>(supabase.from("articles").select("id,slug,title,subtitle,content,cover_url,created_at,featured,tags,author_id,profiles!articles_author_id_fkey(id,username,full_name,avatar_url),categories(id,slug,name,description)").eq("published", true).order("created_at", { ascending: false })),
  posts: () => checked<Post[]>(supabase.from("posts").select("id,author_id,community_id,content,image_url,link_urls,created_at,profiles!posts_author_id_fkey(id,username,full_name,avatar_url),communities(name,slug),post_likes(user_id),comments(id)").order("created_at", { ascending: false }).limit(40)),
  events: () => checked<CampusEvent[]>(supabase.from("events").select("id,title,summary,location,starts_at").order("starts_at", { ascending: true })),
  communities: () => checked<Community[]>(supabase.from("communities").select("id,slug,name,description,cover_url,community_members(user_id)").order("name")),
  categories: () => checked<Category[]>(supabase.from("categories").select("id,slug,name,description").order("name")),
  opportunities: async () => {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id,title,type,description,deadline,link,edital_url,attachment_urls,registration_url")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        const existingIds = new Set(data.map((d: { id: string }) => d.id));
        const existingTitles = new Set(data.map((d: { title: string }) => d.title.trim().toLowerCase()));
        const extraDefaults = defaultOpportunities.filter(
          def => !existingIds.has(def.id) && !existingTitles.has(def.title.trim().toLowerCase())
        );
        return [...data, ...extraDefaults] as Opportunity[];
      }
    } catch {
      // Fallback below
    }
    return defaultOpportunities;
  },
};
