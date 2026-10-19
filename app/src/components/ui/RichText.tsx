// Выводит HTML из RichTextEditor. Значение чистится при сохранении
// (lib/rich-text.ts) — здесь только оформление.
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
