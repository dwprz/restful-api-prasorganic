import { NextFunction, Request, Response } from "express";
import { RajaOngkirUtil } from "../utils/raja-ongkir.util";
import { RajaOngkirService } from "../services/raja-ongkir.service";

export class RajaOngkirController {
  static async createShippingRate(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await RajaOngkirService.createShippingRate(req.body);

      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getProvinces(req: Request, res: Response, next: NextFunction) {
    try {
      let provinces = await RajaOngkirUtil.findProvincesCache();

      if (provinces) {
        return res.status(200).json({ data: provinces });
      }

      provinces = await RajaOngkirService.getProvinces();
      await RajaOngkirUtil.cacheProvinces(provinces);

      res.status(200).json({ data: provinces });
    } catch (error) {
      next(error);
    }
  }

  static async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const province_id = req.query["provinceId"] as string;

      let cities = await RajaOngkirUtil.findCitiesCacheByProvinceId(
        province_id
      );

      if (cities) {
        return res.status(200).json({ data: cities });
      }

      cities = await RajaOngkirService.getCitiesByProvinceId(province_id);
      await RajaOngkirService.cacheCitiesByProvinceId(province_id, cities);

      res.status(200).json({ data: cities });
    } catch (error) {
      next(error);
    }
  }

  static async getSubdistricts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const city_id = req.query["cityId"] as string;

      let subdistricts = await RajaOngkirUtil.findSubdistrictsCacheByCityId(
        city_id
      );

      if (subdistricts) {
        return res.status(200).json({ data: subdistricts });
      }

      subdistricts = await RajaOngkirService.getSubdistrictsByCityId(city_id);
      await RajaOngkirService.cacheSubdistrictsByCityId(city_id, subdistricts);

      res.status(200).json({ data: subdistricts });
    } catch (error) {
      next(error);
    }
  }

  static async getWaybill(req: Request, res: Response, next: NextFunction) {
    try {
      const waybill_number = req.query["waybillNumber"] as string;
      const courier = req.query["courier"] as string;

      let waybill = await RajaOngkirUtil.findWaybillCachebyNumberAndCourier(
        waybill_number,
        courier
      );

      if (waybill) {
        return res.status(201).json({ data: waybill });
      }

      waybill = await RajaOngkirService.createWaybillByNumberAndCourier(
        waybill_number,
        courier
      );

      await RajaOngkirService.cacheWaybillByNumberAndCourier(
        waybill_number,
        courier,
        waybill
      );

      res.status(201).json({ data: waybill });
    } catch (error) {
      next(error);
    }
  }
}
