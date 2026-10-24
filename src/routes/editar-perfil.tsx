import { createFileRoute } from "@tanstack/react-router";
import { EditProfilePage } from "@/components/CampusPages/EditProfilePage";

export const Route = createFileRoute("/editar-perfil")({
  head: () => ({ meta: [{ title: "Editar perfil — InfoCampus" }, { name: "description", content: "Edite suas informações pessoais e acadêmicas." }] }),
  component: EditProfilePage,
});
