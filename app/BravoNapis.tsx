import Image from "next/image";

// Ručně psaný nápis BraVo (průhledné PNG 2521×900) místo textového "BRAVO".
// height = pevná výška v px (malé logo v lištách). Bez height použij className
// (např. "bravo-napis") pro responzivní výšku přes CSS.
export default function BravoNapis({ height, className, priority }: { height?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src="/bravo-logo.png"
      alt="BRAVO"
      width={2521}
      height={900}
      priority={priority}
      className={className}
      style={{ height: height ? `${height}px` : undefined, width: "auto", maxWidth: "100%", display: "block", opacity: 0.88 }}
    />
  );
}
