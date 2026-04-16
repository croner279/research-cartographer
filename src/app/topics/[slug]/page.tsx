import { TopicDetailView } from "@/components/topic-detail-view";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TopicDetailView slug={slug} />;
}
