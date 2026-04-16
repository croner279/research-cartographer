import { WaveDetailView } from "@/components/wave-detail-view";

export default async function WaveDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <WaveDetailView slug={slug} />;
}
