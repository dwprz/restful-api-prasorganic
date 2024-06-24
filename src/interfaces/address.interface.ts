export interface AddressInput {
  user_id: number;
  address_owner: string;
  street: string;
  area_id: number;
  area: string;
  lat: string;
  lng: string;
  suburb_id: number;
  suburb: string;
  city_id: number;
  city: string;
  province_id: number;
  province: string;
  whatsapp: string;
  is_main_address: boolean;
}

export interface AddressUpdate {
  address_id: number;
  user_id: number;
  address_owner?: string;
  street?: string;
  area_id: number;
  area: string;
  suburb_id: number;
  suburb: string;
  city_id: number;
  city: string;
  province_id: number;
  province: string;
  whatsapp: string;
  is_main_address: boolean;
}
