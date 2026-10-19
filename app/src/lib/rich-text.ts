import sanitizeHtml from "sanitize-html";

// Единственное место, где решается, какой HTML из редактора допускается на
// сайт: p, h2, h3, ul, ol, li, strong, em, a, img, br. Чистим при сохранении
// (server actions), на сайте значение выводится как есть.
export function sanitizeRichText(html: string): string {
  const clean = sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "ul", "ol", "li", "strong", "em", "a", "img", "br"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Внешние ссылки всегда с noopener; target не доверяем тому, что прислал клиент.
    transformTags: { a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }, true) },
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  });
  // Ссылка, у которой href отрезало по схеме (javascript: и т.п.), теряет тег, текст остаётся.
  return clean.replace(/<a(?![^>]*\bhref=)[^>]*>([\s\S]*?)<\/a>/g, "$1").trim();
}

/** Пустой ли результат редактора (Tiptap отдаёт "<p></p>" на пустом тексте). */
export function isRichTextEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  return !/<img/.test(html) && html.replace(/<[^>]*>/g, "").trim() === "";
}
