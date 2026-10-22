import { getTranslations } from "next-intl/server";
import type { MessageStatus } from "@/lib/types";

const BADGE: Record<MessageStatus, string> = {
  DRAFT: "badge-empty",
  SENDING: "badge-yellow",
  SENT: "badge-active",
  PARTIAL: "badge-yellow",
  FAILED: "badge-empty",
};

export default async function MessageStatusBadge({ status }: { status: MessageStatus }) {
  const t = await getTranslations("adminMessages.status");
  return <span className={BADGE[status]}>{t(status)}</span>;
}
