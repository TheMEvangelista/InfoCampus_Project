import { Article } from "@/lib/content";
import { safeUrl } from "@/lib/url";
import campusStudents from "@/assets/Images/Image-1.jpg";
import campusRobotics from "@/assets/Images/Image-2.jpg";
import newsImage3 from "@/assets/Images/Image-3.jpg";
import newsImage4 from "@/assets/Images/Image-4.jpg";
import newsImage5 from "@/assets/Images/Image-5.jpg";
import newsImage6 from "@/assets/Images/Image-6.jpg";

const localNewsImages: Record<string, string> = {
  "ciclo-formacao-continuada-dai-anapne": campusStudents,
  "concurso-cultural-raizes-em-movimento": newsImage3,
  "semana-informatica-2026-porto-franco": campusRobotics,
  "oficina-projetos-pibic-pibit-ifma": newsImage4,
  "vii-workshop-informatica-ifma": newsImage5,
  "vii-edifica-projetos-de-impacto": newsImage6,
};
export const articleImage = (article: Article) =>
  safeUrl(article.cover_url) || localNewsImages[article.slug] || campusStudents;
