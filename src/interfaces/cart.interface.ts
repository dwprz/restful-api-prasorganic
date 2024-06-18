import { UserRole } from "./user.interface";

export interface CartInput {
  user_id: number;
  product_id: number;
  quantity: number;
  total_gross_price: number;
}

export interface CartDelete {
  user_id: number;
  cart_item_id: number;
}

export interface CartByProductName {
  page: number;
  product_name: string;
}

export interface CartDetails {
  product: {
    product_id: number;
    product_name: string;
    image: string | null;
    rate: number | null;
    sold: number | null;
    price: number;
    stock: number;
    description: string | null;
    created_at: Date;
    updated_at: Date | null;
  };
  total_quantity: number;
  sum_total_gross_price: number;
  cart: CartWithUser[];
}

export interface CartWithUser {
  user: {
    user_id: number;
    email: string;
    photo_profile: string | null;
    role: UserRole;
  };
  quantity: number;
  total_gross_price: number;
}

export interface CartOutput {
  cart_item_id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  image: string;
  rate: number | null;
  sold: number | null;
  price: number;
  total_gross_price: number;
  quantity: number;
  stock: number;
  description: string | null;
  is_top_product: boolean;
}
