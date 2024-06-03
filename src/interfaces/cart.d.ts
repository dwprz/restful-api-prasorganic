export interface CartInput {
  product_name: string;
  image: string;
  quantity: number;
  price: number;
  total_price: number;
  stock: number;
  user_id: number;
  product_id: number;
}

export interface CartOutput {
  cart_id: number;
  product_name: string;
  image: string;
  quantity: number;
  price: number;
  total_price: number;
  stock: number;
  user_id: number;
  product_id: number;
}
