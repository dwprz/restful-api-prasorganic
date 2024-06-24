export interface Province {
  id: number;
  name: string;
  lat: number;
  lng: number;
  country: {
    id: number;
    name: string;
    code: string;
  };
}

export interface City {
  province: {
    id: number;
    name: string;
    lat: number;
    lng: number;
  };
  country: {
    id: number;
    name: string;
    code: string;
  };
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export interface Suburb {
  id: number;
  name: string;
  lat: number;
  lng: number;
  city: {
    id: number;
    name: string;
    lat: number;
    lng: number;
  };
  province: {
    id: number;
    name: string;
    lat: number;
    lng: number;
  };
  country: {
    id: number;
    name: string;
    code: string;
  };
}

export interface Area {
  suburb: {
    id: number;
    name: string;
    lat: number;
    lng: number;
  };
  city: {
    id: number;
    name: string;
    lat: number;
    lng: number;
  };
  province: {
    id: number;
    name: string;
    lat: number;
    lng: number;
  };
  country: {
    id: number;
    name: string;
    code: string;
  };
  id: number;
  name: string;
  postcode: string;
  lat: number;
  lng: number;
}

// saat pricing type latitude dan longitude menjadi string

export interface PricingRequest {
  cod: boolean;
  destination: {
    area_id: number;
    lat: string;
    lng: string;
    suburb_id: number;
  };
  for_order: true;
  height: number;
  item_value: number;
  length: number;
  limit: number;
  origin: {
    area_id: number;
    lat: string;
    lng: string;
    suburb_id: number;
  };
  page: number;
  sort_by: string[];
  weight: number;
  width: number;
}

export interface ShippingWebhook {
  auth: string;
  order_id: string;
  tracking_id: string;
  order_tracking_id: string;
  external_id: string;
  status_date: string;
  internal: {
    id: number;
    name: string;
    description: string;
  };
  external: {
    id: number;
    name: string;
    description: string;
  };
  internal_status: { code: number; name: string; description: string };
  external_status: {
    code: number;
    name: string;
    description: string;
  };
  awb?: string;
  order_type: string;
}

export interface ShippingTracking {
  shipper_status: {
    code: number;
    name: string;
    description: string;
  };
  logistic_status: {
    code: number;
    name: string;
    description: string;
  };
  created_date: string;
}

export interface LabelCreate {
  id: string[];
  type: string;
}
