import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-5 transition-colors">
      <ChevronLeft size={16} /> {label}
    </Link>
  );
}
