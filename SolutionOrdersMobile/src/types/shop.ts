export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  tag: string;
  description: string;
}