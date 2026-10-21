import { content } from "@/lib/content";
import { useQuery } from "@tanstack/react-query";

export function useCampusData() {
  const articles = useQuery({ queryKey: ["articles"], queryFn: content.articles });
  const posts = useQuery({ queryKey: ["posts"], queryFn: content.posts });
  const events = useQuery({ queryKey: ["events"], queryFn: content.events });
  const communities = useQuery({ queryKey: ["communities"], queryFn: content.communities });
  const categories = useQuery({ queryKey: ["categories"], queryFn: content.categories });
  const opportunities = useQuery({ queryKey: ["opportunities"], queryFn: content.opportunities });
  return { articles, posts, events, communities, categories, opportunities };
}
