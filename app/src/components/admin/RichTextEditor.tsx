"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered } from "lucide-react";
import { useRef, useState } from "react";

// Общий визуальный редактор (описание товара, лаунж, статьи). Отдаёт HTML;
// допустимые теги — те же, что в lib/rich-text.ts, на сервере всё равно чистится.
export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: { openOnClick: false },
      }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      h3: editor?.isActive("heading", { level: 3 }) ?? false,
      ul: editor?.isActive("bulletList") ?? false,
      ol: editor?.isActive("orderedList") ?? false,
      link: editor?.isActive("link") ?? false,
    }),
  });

  if (!editor || !active) return <div className="min-h-48 rounded-sm border border-border" />;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Адрес ссылки (пусто — убрать ссылку)", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      if (!res.ok) throw new Error();
      const { url } = (await res.json()) as { url: string };
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      setError("Не удалось загрузить картинку");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const btn = (isOn: boolean) =>
    `flex size-9 items-center justify-center rounded-sm border text-foreground transition-colors duration-150 ease-standard ${
      isOn ? "border-foreground bg-surface-sunken" : "border-transparent hover:bg-surface-sunken"
    }`;

  const tools = [
    { title: "Жирный", Icon: Bold, on: active.bold, run: () => editor.chain().focus().toggleBold().run() },
    { title: "Курсив", Icon: Italic, on: active.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { title: "Заголовок", Icon: Heading2, on: active.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { title: "Подзаголовок", Icon: Heading3, on: active.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { title: "Список", Icon: List, on: active.ul, run: () => editor.chain().focus().toggleBulletList().run() },
    { title: "Нумерованный список", Icon: ListOrdered, on: active.ol, run: () => editor.chain().focus().toggleOrderedList().run() },
    { title: "Ссылка", Icon: Link2, on: active.link, run: setLink },
  ];

  return (
    <div className="rich-editor rounded-sm border border-border bg-surface focus-within:border-focus-ring">
      <div className="flex flex-wrap gap-1 border-b border-border p-1.5">
        {tools.map(({ title, Icon, on, run }) => (
          <button key={title} type="button" title={title} aria-label={title} className={btn(on)} onClick={run}>
            <Icon className="size-4" aria-hidden="true" />
          </button>
        ))}
        <button
          type="button"
          title="Вставить картинку"
          aria-label="Вставить картинку"
          className={btn(false)}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file);
          }}
        />
        {uploading && <span className="self-center px-2 font-body text-xs text-foreground-muted">Загрузка…</span>}
        {error && <span className="self-center px-2 font-body text-xs text-danger">{error}</span>}
      </div>
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
