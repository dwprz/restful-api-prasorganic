import { NextFunction, Request, Response } from "express";
import { ShippingService } from "../services/shipping.service";
import { ShippingCache } from "../cache/shipping.cache";
import { OrderService } from "../services/order.service";
import { OrderCache } from "../cache/order.cache";
import { OrderStatus } from "../interfaces/order.interface";
import { ProductOrderModelRetrieve } from "../models/product-order/retrieve.model";
import { ConsoleHelper } from "../helpers/console.helper";
import { ProductModelModify } from "../models/product/modify.model";
import { OrderModelModify } from "../models/order/modify.model";

export class ShippingController {
  static async pricing(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ShippingService.pricing(req.body);

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async manualShipping(req: Request, res: Response, next: NextFunction) {
    try {
      const shipping_order = await ShippingService.orderShipping(req.body);

      const order_id = req.body.order.order_id;
      const shipping_id = shipping_order.order_id;

      const result = await OrderService.addShippingId(order_id, shipping_id);
      await ShippingService.requestPickup(shipping_id);

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async requestPickup(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.shipping_ids.length > 30) {
        return res.status(400).json({ error: "more than 30 shipping ids" });
      }

      await ShippingService.requestPickup(req.body.shipping_ids);
      res.status(200).json({ data: "requested pickup successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async createLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ShippingService.createLabel(req.body);

      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async notification(req: Request, res: Response, next: NextFunction) {
    try {
      ShippingService.handleWebhook(req.body)
        .then(() => {
          ConsoleHelper.log("success handle shipper webhook");
        })
        .catch((error) => {
          ConsoleHelper.error("handle shipper webhook", error);
        });

      res.status(200).json({ data: "OK" });
    } catch (error) {
      next(error);
    }
  }

  static async tracking(req: Request, res: Response, next: NextFunction) {
    try {
      const shipping_id = req.params["shippingId"];

      const tracking_cache = await ShippingCache.findTrackingByShippingId(
        shipping_id
      );

      if (tracking_cache) {
        return res.status(200).json({ data: tracking_cache });
      }

      const tracking = await ShippingService.trackingByShippingId(shipping_id);
      await ShippingCache.cacheTrackingByShippingId(shipping_id, tracking);

      res.status(200).json({ data: tracking });
    } catch (error) {
      next(error);
    }
  }

  static async getProvinces(req: Request, res: Response, next: NextFunction) {
    try {
      const provinces_cache = await ShippingCache.findProvinces();

      if (provinces_cache) {
        return res.status(200).json({ data: provinces_cache });
      }

      const provinces = await ShippingService.getProvinces();
      await ShippingCache.cacheProvinces(provinces);

      res.status(200).json({ data: provinces });
    } catch (error) {
      next(error);
    }
  }

  static async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const province_id = Number(req.query["provinceId"]);

      const cities_cache = await ShippingCache.findCitiesByProvinceId(
        province_id
      );

      if (cities_cache) {
        return res.status(200).json({ data: cities_cache });
      }

      const cities = await ShippingService.getCitiesByProvinceId(province_id);
      await ShippingCache.cacheCitiesByProvinceId(province_id, cities);

      res.status(200).json({ data: cities });
    } catch (error) {
      next(error);
    }
  }

  static async getSuburbs(req: Request, res: Response, next: NextFunction) {
    try {
      const city_id = Number(req.query["cityId"]);

      const suburbs_cache = await ShippingCache.findSuburbsByCityId(city_id);

      if (suburbs_cache) {
        return res.status(200).json({ data: suburbs_cache });
      }

      const suburbs = await ShippingService.getSuburbsByCityId(city_id);
      await ShippingCache.cacheSuburbsByCityId(city_id, suburbs);

      res.status(200).json({ data: suburbs });
    } catch (error) {
      next(error);
    }
  }

  static async getAreas(req: Request, res: Response, next: NextFunction) {
    try {
      const suburb_id = Number(req.query["suburbId"]);

      const areas_cache = await ShippingCache.findAreasBySuburbId(suburb_id);

      if (areas_cache) {
        return res.status(200).json({ data: areas_cache });
      }

      const areas = await ShippingService.getAreasBySuburbId(suburb_id);
      await ShippingCache.cacheAreasBySuburbId(suburb_id, areas);

      res.status(200).json({ data: areas });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrderShipping(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const shipping_id = req.params["shippingId"] as string;
      const order_id = req.params["orderId"] as string;

      await ShippingService.cancelOrderShippingByShippingId(shipping_id);

      const order_cache = await OrderCache.findById(order_id);

      if (order_cache) {
        await ProductModelModify.rollbackStocks(order_cache.products);

        await OrderModelModify.updateById({ status: OrderStatus.CANCELLED }, order_id);
      } else {
        const products_order = await ProductOrderModelRetrieve.findManyById(order_id);

        await ProductModelModify.rollbackStocks(products_order);
        await OrderModelModify.updateById({ status: OrderStatus.CANCELLED }, order_id);
      }

      res.status(200).json({ data: "cancelled order shipping successfully" });
    } catch (error) {
      next(error);
    }
  }
}
