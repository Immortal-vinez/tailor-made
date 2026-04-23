export type ProductCategory = "men" | "women" | "children";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  createdAt: string;
}
