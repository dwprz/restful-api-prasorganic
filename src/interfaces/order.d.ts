import { Product } from "@prisma/client";
import { number } from "zod";
import { ProductOrderHistori } from "./product";

export interface Order {
  order_id?: number;
  total_amount: number;
  logistic: string;
  payment_method: string;
  status: string;

  user_id: number;
  email: string;
  full_name: string;

  address_owner: string;
  street: string;
  subdistrict: string;
  district: string;
  province: string;
  country?: string;
  postal_code: string;
  whatsapp: string;
}

export interface OrderInput {
  order: Order;
  products: ProductOrderHistori[];
}

export interface OrderUpdateStatus {
  order_id: number;
  status: string;
}
