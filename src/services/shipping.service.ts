import axios from "axios";
import { ErrorHelper } from "../helpers/error.helper";
import "dotenv/config";
import { EnvHelper } from "../helpers/env.helper";
import {
  LabelCreate,
  PricingRequest,
  ShippingTracking,
  ShippingWebhook,
} from "../interfaces/shipping.interface";
import { OrderStatus, OrderWithProducts } from "../interfaces/order.interface";
import { ShippingHelper } from "../helpers/shipping.helper";
import { OrderModelModify } from "../models/order/modify.model";
import { ShippingCache } from "../cache/shipping.cache";
import { AxiosError } from "axios";
import ErrorResponse from "../errors/response.error";

export class ShippingService {
  static async pricing(data: PricingRequest) {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      const response = await axios.post(
        `${SHIPPER_BASE_URL}/v3/pricing/domestic`,
        data,
        {
          headers: {
            "X-API-KEY": SHIPPER_API_KEY,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      throw ErrorHelper.catch("pricing order shipping", error);
    }
  }

  static async orderShipping(data: OrderWithProducts) {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      const formated_order = ShippingHelper.formatShippingOrderRequest(data);

      const response = await axios.post(
        `${SHIPPER_BASE_URL}/v3/order`,
        formated_order,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": SHIPPER_API_KEY,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new ErrorResponse(409, "shipping id is already exists ");
      }

      throw ErrorHelper.catch("order shipping", error);
    }
  }

  static async requestPickup(shipping_ids: string | string[]) {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      const formated_request =
        ShippingHelper.formatPickupsRequest(shipping_ids);

      await axios.post(`${SHIPPER_BASE_URL}/v3/pickup`, formated_request, {
        headers: {
          "X-API-KEY": SHIPPER_API_KEY,
        },
      });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        throw new ErrorResponse(400, "shipping id is invalid");
      }

      throw ErrorHelper.catch("pickups request", error);
    }
  }

  static async createLabel(data: LabelCreate) {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      const response = await axios.post(
        `${SHIPPER_BASE_URL}/v3/order/label`,
        data,
        {
          headers: {
            "X-API-KEY": SHIPPER_API_KEY,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      throw ErrorHelper.catch("create label", error);
    }
  }

  static async handleWebhook(data: ShippingWebhook) {
    const external_status_code = data.external_status.code;
    const order_id = data.external_id; // external_id ini berisi order_id dari aplikasi ini
    const shipping_id = data.order_id; // order_id ini berisi shipping_id dari aplikasi ini

    const new_tracking = ShippingHelper.formatTracking(data);
    await ShippingCache.updateTrackingByShippingId(shipping_id, new_tracking);

    if (external_status_code === 1000) {
      await OrderModelModify.updateById(
        { status: OrderStatus.IN_PROGRESS },
        order_id
      );
    }

    if (
      external_status_code === 2000 ||
      external_status_code === 2010 ||
      external_status_code === 3000
    ) {
      await OrderModelModify.updateById(
        { status: OrderStatus.COMPLETED },
        order_id
      );
    }

    if (external_status_code === 1340) {
      await OrderModelModify.updateById(
        { status: OrderStatus.RETURN_PROCESSING },
        order_id
      );
    }

    if (external_status_code === 1370) {
      await OrderModelModify.updateById(
        { status: OrderStatus.FAILED },
        order_id
      );
    }

    if (external_status_code === 1380) {
      await OrderModelModify.updateById(
        { status: OrderStatus.LOST_OR_DAMAGED },
        order_id
      );
    }

    if (external_status_code === 999) {
      await OrderModelModify.updateById(
        { status: OrderStatus.CANCELLED },
        order_id
      );
    }
  }

  static async trackingByShippingId(shipping_id: string) {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      const response = await axios.get(
        `${SHIPPER_BASE_URL}/v3/order/${shipping_id}`,
        {
          headers: {
            "X-API-KEY": SHIPPER_API_KEY,
          },
        }
      );

      return response.data.data.trackings as ShippingTracking[];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new ErrorResponse(404, "shipping order is not found");
      }

      throw ErrorHelper.catch("get shipping tracking", error);
    }
  }

  static async getProvinces() {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      const response = await axios.get(
        `${SHIPPER_BASE_URL}/v3/location/country/228/provinces?limit=38`,
        {
          headers: {
            "X-API-KEY": SHIPPER_API_KEY,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      throw ErrorHelper.catch("get provinces", error);
    }
  }

  static async getCitiesByProvinceId(province_id: number) {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      const response = await axios.get(
        `${SHIPPER_BASE_URL}/v3/location/province/${province_id}/cities?limit=38`,
        {
          headers: {
            "X-API-KEY": SHIPPER_API_KEY,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      throw ErrorHelper.catch("get cities by province id", error);
    }
  }

  static async getSuburbsByCityId(city_id: number) {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      const response = await axios.get(
        `${SHIPPER_BASE_URL}/v3/location/city/${city_id}/suburbs?limit=51`,
        {
          headers: {
            "X-API-KEY": SHIPPER_API_KEY,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      throw ErrorHelper.catch("get cities by province id", error);
    }
  }

  static async getAreasBySuburbId(suburb_id: number) {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      const response = await axios.get(
        `${SHIPPER_BASE_URL}/v3/location/suburb/${suburb_id}/areas?limit=35`,
        {
          headers: {
            "X-API-KEY": SHIPPER_API_KEY,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      throw ErrorHelper.catch("get areas by suburb id", error);
    }
  }

  static async cancelOrderShippingByShippingId(shipping_id: string) {
    try {
      const SHIPPER_BASE_URL = process.env.SHIPPER_BASE_URL;
      const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;

      EnvHelper.validate({ SHIPPER_BASE_URL, SHIPPER_API_KEY });

      await axios.delete(`${SHIPPER_BASE_URL}/v3/order/${shipping_id}`, {
        headers: {
          "X-API-KEY": SHIPPER_API_KEY,
        },
      });
    } catch (error) {
      throw ErrorHelper.catch("cancel order shipping by shipping id", error);
    }
  }
}
