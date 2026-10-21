import { AppShell } from "@/components/AppShell";
import { PageHeading } from "@/components/CampusContent/PageHeading";

export function LegalPage({ kind }: { kind: "termos" | "privacidade" }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeading title={kind === "termos" ? "Termos de uso" : "Política de privacidade"} />
        <p className="text-sm leading-7 text-muted-foreground">
          O InfoCampus é um espaço de troca entre estudantes da comunidade acadêmica do IFMA.
          Respeite as outras pessoas, publique apenas conteúdo que você tem direito de compartilhar
          e não divulgue dados pessoais de terceiros.
        </p>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          As informaÃ§ões do seu perfil e as publicaÃ§ões são visíveis para outras pessoas.
          Mensagens privadas são acessíveis apenas às pessoas envolvidas. Para solicitar alteração
          ou exclusão de informaÃ§ões, entre em contato com a administração da comunidade.
        </p>
      </div>
    </AppShell>
  );
}
