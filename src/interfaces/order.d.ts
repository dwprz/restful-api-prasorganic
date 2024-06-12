import { Product } from "@prisma/client";
import { number } from "zod";

export interface Order {
  order_id?: number;
  total_net_price: number;
  courier: string;
  payment_method: string;
  status: string;
  waybill_number: string;

  user_id: number;
  email: string;
  buyer: string;

  address_owner: string;
  street: string;
  subdistrict: string;
  city: string;
  province: string;
  whatsapp: string;
}

export interface OrderInput {
  order: Order;
  products: ProductOrder[];
}

export interface ProductOrder {
  product_order_id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  image: string;
  quantity: number;
  price: number;
  total_gross_price: number;
}
