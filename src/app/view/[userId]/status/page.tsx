import { redirect } from "next/navigation";

interface LegacySharedStatusPageProps {
  params: Promise<{ userId: string }>;
}

export default async function LegacySharedStatusPage({
  params,
}: LegacySharedStatusPageProps) {
  const { userId } = await params;
  redirect(`/view/${userId}/chat`);
}
