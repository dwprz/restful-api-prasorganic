export interface AddressInput {
  user_id: number;
  address_owner: string;
  street: string;
  subdistrict_id: string;
  subdistrict: string;
  city_id: string;
  city: string;
  province_id: string;
  province: string;
  whatsapp: string;
  is_main_address: boolean;
}

export interface AddressUpdate {
  address_id: number;
  user_id: number;
  address_owner?: string;
  street?: string;
  subdistrict_id?: string;
  subdistrict?: string;
  city_id?: string;
  city?: string;
  province_id?: string;
  province?: string;
  whatsapp?: string;
  is_main_address?: boolean;
}
