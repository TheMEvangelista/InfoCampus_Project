export function Empty({ text = "Nada por aqui ainda." }: { text?: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>;
}
