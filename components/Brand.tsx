import Image from "next/image";

// FarmPaisa brand assets (public/brand). The full mark (wheat, leaf and ₹ coin) is for
// large spaces; the short icon (coin and leaf) stays readable down to favicon size.
// Both are decorative next to the wordmark, so alt text is empty.

export function BrandMark({ size = 56 }: { size?: number }) {
  return <Image src="/brand/farmpaisa-mark.svg" alt="" width={size} height={size} priority unoptimized />;
}

export function BrandIcon({ size = 32 }: { size?: number }) {
  return <Image src="/brand/farmpaisa-icon.svg" alt="" width={size} height={size} priority unoptimized />;
}

// "Farm" in leaf green and "Paisa" in coin gold; `onDark` for the green sidebar
export function Wordmark({ onDark = false, className = "" }: { onDark?: boolean; className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      <span className={onDark ? "text-white" : "text-primary-700"}>Farm</span>
      <span className={onDark ? "text-accent-300" : "text-accent-600"}>Paisa</span>
    </span>
  );
}
