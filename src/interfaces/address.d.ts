export interface AddressInput {
  address_owner: string;
  street: string;
  subdistrict: string;
  district: string;
  province: string;
  country?: string;
  postal_code: string;
  whatsapp: string;
  user_id: number;
  is_main_address: boolean;
}

export interface AddressUpdate {
  address_id: number;
  user_id: number;
  address_owner?: string;
  street?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  country?: string;
  postal_code?: string;
  whatsapp?: string;
  is_main_address?: boolean;
}
