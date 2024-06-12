export interface Province {
  province_id: string;
  province: string;
}

export interface City {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
}

export interface Subdistrict {
  subdistrict_id: string;
  province_id: string;
  province: string;
  city_id: string;
  city: string;
  type: string;
  subdistrict_name: string;
}

export interface shippingRateCreate {
  origin: string,
  originType: string,
  destination: string,
  destinationType: string,
  weight: number,
  courier: string,
}

export interface Waybill {
  delivered: boolean;
  manifest: Manifest[];
}

interface Manifest {
  manifest_code: string;
  manifest_description: string;
  manifest_date: string;
  manifest_time: string;
  city_name: string;
}
