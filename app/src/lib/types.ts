export interface Category {
  id: string;
  label: string;
}

export interface Product {
  id: number;
  category: string;
  name: string;
  price: string;
  oldPrice?: string;
  stock: number;
  brand: string;
  flavor?: string;
  strength?: string;
  packaging?: string;
  imageUrl?: string;
  needsManualReview?: boolean;
  /** Заполненные характеристики по типу товара (только на странице товара). */
  specs?: { label: string; value: string }[];
  /** Все фото в порядке показа (только на странице товара). */
  gallery?: string[];
  /** Описание от админа, уже очищенный HTML (только на странице товара). */
  description?: string;
  /** Poster's own product_id — only set for DB-synced products, used server-side to create real Poster orders. */
  posterId?: number;
}
