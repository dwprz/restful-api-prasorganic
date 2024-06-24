export interface Product {
  product_id: number;
  product_name: string;
  image: string;
  rate: number | null;
  sold: number | null;
  price: number;
  stock: number;
  height: number;
  length: number;
  width: number;
  weight: number;
  description: string | null;
  is_top_product: boolean;
  created_at: Date;
  updated_at: Date | null;
  categories?: string | string[];
}

export interface ProductInput {
  product_name: string;
  image: string;
  price: number;
  stock: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  description?: string;
  categories: string | string[];
}

export interface ProductQuery {
  page: number;
  name?: string;
  categories?: string | string[];
}

export interface ProductUpdate {
  product_id: number;
  product_name?: string;
  rate?: number | null;
  sold?: number | null;
  price?: number;
  stock?: number;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  description?: string | null;
  is_top_product?: boolean;
}

export interface ProductImageUpdate {
  product_id: number;
  image?: string | null;
  new_image: string;
}
