import redis from "../apps/redis.app";
import ErrorResponse from "../error/response.error";
import {
  City,
  Province,
  Subdistrict,
  Waybill,
} from "../interfaces/raja-ongkir";
import { RajaOngkirValidation } from "../validations/raja-ongkir.validation";
import validation from "../validations/validation";

export class RajaOngkirUtil {
  static async cacheProvinces(provinces: Province[]) {
    try {
      await redis.setex("provinces", 3600 * 24, JSON.stringify(provinces));

      return provinces;
    } catch (error) {
      throw new ErrorResponse(400, "failed to caching provinces");
    }
  }

  static async cacheCitiesByProvinceId(province_id: string, cities: City[]) {
    try {
      await redis.setex(
        `cities:province_id:${province_id}`,
        3600 * 24,
        JSON.stringify(cities)
      );

      return cities;
    } catch (error) {
      throw new ErrorResponse(400, "failed to caching cities by province id");
    }
  }

  static async cacheSubdistrictsByCityId(
    city_id: string,
    subdistricts: Subdistrict[]
  ) {
    try {
      await redis.setex(
        `subdistricts:city_id:${city_id}`,
        3600 * 24,
        JSON.stringify(subdistricts)
      );

      return subdistricts;
    } catch (error) {
      throw new ErrorResponse(400, "failed to caching subdistricts by city id");
    }
  }

  static async cacheWaybillByNumberAndCourier(
    waybill_number: string,
    courier: string,
    waybill: Waybill
  ) {
    try {
      await redis.setex(
        `${courier}:waybill:waybill_number:${waybill_number}`,
        3600 * 4,
        JSON.stringify(waybill)
      );

      return waybill;
    } catch (error) {
      throw new ErrorResponse(
        400,
        "failed to caching waybill by number and courier"
      );
    }
  }

  static async findProvincesCache() {
    try {
      const provinces_cache = await redis.get("provinces");

      if (!provinces_cache) return null;

      return JSON.parse(provinces_cache);
    } catch (error) {
      throw new ErrorResponse(400, "failed to find provinces cache");
    }
  }

  static async findCitiesCacheByProvinceId(province_id: string) {
    validation(RajaOngkirValidation.province_id, province_id);

    try {
      const cities = await redis.get(`cities:province_id:${province_id}`);

      if (!cities) return null;

      return JSON.parse(cities);
    } catch (error) {
      throw new ErrorResponse(
        400,
        "failed to find cities cache by province id"
      );
    }
  }

  static async findSubdistrictsCacheByCityId(city_id: string) {
    validation(RajaOngkirValidation.city_id, city_id);

    try {
      const subdistricts = await redis.get(`subdistricts:city_id:${city_id}`);

      if (!subdistricts) return null;

      return JSON.parse(subdistricts);
    } catch (error) {
      throw new ErrorResponse(
        400,
        "failed to find subdistricts cache by city id"
      );
    }
  }

  static async findWaybillCachebyNumberAndCourier(
    waybill_number: string,
    courier: string
  ) {
    validation(RajaOngkirValidation.waybillGet, {
      waybill_number,
      courier,
    });

    try {
      const waybill = await redis.get(
        `${courier}:waybill:waybill_number:${waybill_number}`
      );

      if (!waybill) return null;

      return JSON.parse(waybill);
    } catch (error) {
      throw new ErrorResponse(
        400,
        "failed to find waybill cache by number and courier"
      );
    }
  }
}
