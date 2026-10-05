import { Star } from "lucide-react";

export function Stars({ value, max = 5, size = 18 }: { value: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} width={size} height={size} className={i < value ? "fill-orange text-orange" : "text-line fill-line"} aria-hidden />
      ))}
    </span>
  );
}
