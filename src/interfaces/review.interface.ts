export interface ReviewInput {
  user_id: number;
  product_id: number;
  quantity: number;
  rating: number;
  review: string | null;
}

export interface Review {
  user_id: number;
  product_id: number;
  rating: number;
  review: string | null;
  is_highlight?: boolean;
  created_at?: string;
}

export interface ReviewOutput {
  user_id: number;
  product_id: number;
  rating: number;
  review: string | null;
  is_highlight: boolean;
  creatd_at: string;
  product_name: string;
  product_image: string;
  is_top_product: boolean;
}

export interface ReviewHighlightUpdate {
  user_id: number;
  product_id: number;
  is_highlight: boolean;
}
