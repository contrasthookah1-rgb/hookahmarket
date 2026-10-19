import Link from "next/link";
import { UploadedImage } from "@/components/ui/UploadedImage";
import { formatArticleDate, type ArticleCard } from "@/lib/blog";

export function ArticleCardView({ article }: { article: ArticleCard }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-border bg-surface font-body shadow-sm transition-[box-shadow,transform] duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:-translate-y-0.5 focus-visible:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-sunken">
        {article.coverImage && (
          <UploadedImage
            src={article.coverImage}
            alt=""
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 ease-standard group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <time dateTime={article.publishedAt.toISOString()} className="text-xs text-foreground-muted">
          {formatArticleDate(article.publishedAt)}
        </time>
        <h3 className="font-display text-lg leading-snug text-foreground">{article.title}</h3>
        {article.excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-foreground-secondary">{article.excerpt}</p>}
      </div>
    </Link>
  );
}
