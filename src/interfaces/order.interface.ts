export interface Order {
  order_id?: string | null;
  gross_amount: number;
  status: OrderStatus;

  shipping_id?: string | null;
  courier: string;
  rate_id: number;
  rate_name: string;
  rate_type: string;
  cod: boolean;
  use_insurance: boolean;
  package_type: number;

  payment_method?: string | null;
  snap_token?: string;
  snap_redirect_url?: string;

  user_id: number;
  email: string;
  buyer: string;

  height: number;
  length: number;
  width: number;
  weight: number;

  address_owner: string;
  street: string;
  area_id: number;
  area: string;
  lat: string;
  lng: string;
  suburb: string;
  city: string;
  province: string;
  whatsapp: string;

  created_at?: string;
  updated_at?: string | null;
}

export interface OrderWithProducts {
  order: Order;
  products: ProductOrder[];
}

export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  REFUND_PROCESSING = "REFUND_PROCESSING",
  REFUND_COMPLETED = "REFUND_COMPLETED",
  RETURN_PROCESSING = "RETURN_PROCESSING",
  RETURN_COMPLETED = "RETURN_COMPLETED",
  LOST_OR_DAMAGED = "LOST_OR_DAMAGED",
}

export interface ProductOrder {
  product_order_id?: number;
  order_id?: string;
  product_id: number;
  product_name: string;
  image: string;
  quantity: number;
  price: number;
  total_gross_price: number;
}

