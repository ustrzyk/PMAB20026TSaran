export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  tag: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ProductSortOption = 'default' | 'name' | 'priceAsc' | 'priceDesc';