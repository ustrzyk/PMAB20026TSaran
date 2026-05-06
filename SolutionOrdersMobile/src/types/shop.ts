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

export type ProductSortOption = 'default' | 'name' | 'priceAsc' | 'priceDesc';