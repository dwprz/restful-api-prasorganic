import { OrderWithProducts } from "../interfaces/order.interface";
import "dotenv/config";
import { EnvHelper } from "./env.helper";
import { ShippingWebhook } from "../interfaces/shipping.interface";

export class ShippingHelper {
  static formatShippingOrderRequest({ order, products }: OrderWithProducts) {
    const STORE_NAME = process.env.STORE_NAME;
    const STORE_PHONE_NUMBER = process.env.STORE_PHONE_NUMBER;
    const SHIPPING_COVERAGE = process.env.SHIPPING_COVERAGE;
    const STORE_ADDRESS = process.env.STORE_ADDRESS;
    const STORE_AREA_ID = process.env.STORE_AREA_ID;
    const STORE_LATITUDE = process.env.STORE_LATITUDE;
    const STORE_LONGITUDE = process.env.STORE_LONGITUDE;
    const SHIPPING_PAYMENT_TYPE = process.env.SHIPPING_PAYMENT_TYPE;

    EnvHelper.validate({
      STORE_NAME,
      STORE_PHONE_NUMBER,
      SHIPPING_COVERAGE,
      STORE_ADDRESS,
      STORE_AREA_ID,
      STORE_LATITUDE,
      STORE_LONGITUDE,
      SHIPPING_PAYMENT_TYPE,
    });

    const formated_order = {
      consignee: {
        name: order.address_owner,
        phone_number: order.whatsapp,
      },
      consigner: {
        name: STORE_NAME,
        phone_number: STORE_PHONE_NUMBER,
      },
      courier: {
        cod: order.cod,
        rate_id: order.rate_id,
        use_insurance: order.use_insurance,
      },
      coverage: SHIPPING_COVERAGE,
      destination: {
        address: order.street,
        area_id: order.area_id,
        lat: order.lat,
        lng: order.lng,
      },
      external_id: order.order_id,
      origin: {
        address: STORE_ADDRESS,
        area_id: Number(STORE_AREA_ID),
        lat: STORE_LATITUDE,
        lng: STORE_LONGITUDE,
      },
      package: {
        height: order.height,
        items: products.map((product) => {
          return {
            name: product.product_name,
            price: product.price,
            qty: product.quantity,
          };
        }),
        length: order.length,
        package_type: order.package_type,
        price: order.gross_amount,
        weight: order.weight,
        width: order.width,
      },
      payment_type: SHIPPING_PAYMENT_TYPE,
    };

    return formated_order;
  }

  static formatPickupsRequest(shipping_ids: string | string[]) {
    if (typeof shipping_ids === "string") {
      shipping_ids = [shipping_ids];
    }

    return {
      data: {
        order_activation: {
          order_id: shipping_ids,
        },
      },
    };
  }

  static formatTracking(data: ShippingWebhook) {
    return {
      shipper_status: {
        code: data.external_status.code,
        name: data.external_status.name,
        description: data.external_status.description,
      },
      logistic_status: {
        code: data.external.id,
        name: data.external.name,
        description: data.external.description,
      },
      created_date: data.status_date,
    };
  }
}
