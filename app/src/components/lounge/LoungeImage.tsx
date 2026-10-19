import Image from "next/image";

// Our own files and Vercel Blob uploads go through next/image (resized and
// compressed by Next); a photo pasted from any other site can't be (the host
// isn't whitelisted in next.config.ts and next/image would throw), so it
// renders as a plain <img>.
const OPTIMIZABLE_HOST = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;

export function LoungeImage({
  src,
  alt,
  sizes,
  priority,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (src.startsWith("/") || OPTIMIZABLE_HOST.test(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- see comment above
  return <img src={src} alt={alt} className={`absolute inset-0 size-full ${className}`} />;
}
