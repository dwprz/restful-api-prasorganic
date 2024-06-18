export interface Order {
  order_id?: number;
  gross_amount: number;
  courier: string;
  payment_method?: string | null;
  status: OrderStatus;
  snap_token?: string;
  snap_redirect_url?: string;
  waybill_number?: string;

  user_id: number;
  email: string;
  buyer: string;

  address_owner: string;
  street: string;
  city: string;
  province: string;
  whatsapp: string;

  created_at?: Date;
  updated_at?: Date | null;
}

export interface OrderWithProducts {
  order: Order;
  products: ProductOrder[];
}

export enum OrderStatus {
  PENDING_PAYMENT,
  PAID,
  ON_PROGRESS,
  COMPLETED,
  CANCELED,
  FAILED,
  REFUND_PROCESSED,
  REFUND_COMPLETED,
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
