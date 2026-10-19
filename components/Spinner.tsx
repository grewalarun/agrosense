// Inline spinner for buttons; inherits the button's text colour
export default function Spinner({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5 ${className}`} />;
}
