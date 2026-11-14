import { LabDetailPage, labMetadata, labStaticParams } from "@/components/labs/lab-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return labStaticParams("system");
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return labMetadata("system", slug);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <LabDetailPage kind="system" slug={slug} />;
}
