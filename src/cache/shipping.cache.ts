import redis from "../apps/redis.app";
import { ErrorHelper } from "../helpers/error.helper";
import {
  Area,
  City,
  Province,
  ShippingTracking,
  Suburb,
} from "../interfaces/shipping.interface";

export class ShippingCache {
  static async cacheTrackingByShippingId(
    shipping_id: string,
    trackings: ShippingTracking[]
  ) {
    try {
      await redis.setex(
        `shipping_id:${shipping_id}:trackings`,
        3600 * 24 * 3,
        JSON.stringify(trackings)
      );
    } catch (error) {
      throw ErrorHelper.catch("cache trackings by shipping id", error);
    }
  }

  static async cacheProvinces(provinces: Province[]) {
    try {
      await redis.setex(`provinces`, 3600 * 24, JSON.stringify(provinces));
    } catch (error) {
      throw ErrorHelper.catch("cache province", error);
    }
  }

  static async cacheCitiesByProvinceId(province_id: number, cities: City[]) {
    try {
      await redis.setex(
        `province_id:${province_id}:cities`,
        3600 * 24,
        JSON.stringify(cities)
      );
    } catch (error) {
      throw ErrorHelper.catch("cache cities by provice id", error);
    }
  }

  static async cacheSuburbsByCityId(city_id: number, suburbs: Suburb[]) {
    try {
      await redis.setex(
        `city_id:${city_id}:suburbs`,
        3600 * 24,
        JSON.stringify(suburbs)
      );
    } catch (error) {
      throw ErrorHelper.catch("cache suburbs by city id", error);
    }
  }

  static async cacheAreasBySuburbId(suburb_id: number, areas: Area[]) {
    try {
      await redis.setex(
        `suburb_id:${suburb_id}:areas`,
        3600 * 24,
        JSON.stringify(areas)
      );
    } catch (error) {
      throw ErrorHelper.catch("cache areas by suburb id", error);
    }
  }

  static async findTrackingByShippingId(shipping_id: string) {
    try {
      const tracking_cache = await redis.get(
        `shipping_id:${shipping_id}:trackings`
      );

      if (!tracking_cache) {
        return null;
      }

      return JSON.parse(tracking_cache) as ShippingTracking[];
    } catch (error) {
      throw ErrorHelper.catch("find trackings cache by shipping id", error);
    }
  }

  static async findProvinces() {
    try {
      const provinces_cache = await redis.get("provinces");

      if (!provinces_cache) {
        return null;
      }

      return JSON.parse(provinces_cache) as Province[];
    } catch (error) {
      throw ErrorHelper.catch("find provinces cache", error);
    }
  }

  static async findCitiesByProvinceId(province_id: number) {
    try {
      const cities_cache = await redis.get(`province_id:${province_id}:cities`);

      if (!cities_cache) {
        return null;
      }

      return JSON.parse(cities_cache) as City[];
    } catch (error) {
      throw ErrorHelper.catch("find cities cache by province id", error);
    }
  }

  static async findSuburbsByCityId(city_id: number) {
    try {
      const suburbs_cache = await redis.get(`city_id:${city_id}:suburbs`);

      if (!suburbs_cache) {
        return null;
      }

      return JSON.parse(suburbs_cache) as Suburb[];
    } catch (error) {
      throw ErrorHelper.catch("find suburbs cache by city id", error);
    }
  }

  static async findAreasBySuburbId(suburb_id: number) {
    try {
      const areas_cache = await redis.get(`suburb_id:${suburb_id}:areas`);

      if (!areas_cache) {
        return null;
      }

      return JSON.parse(areas_cache);
    } catch (error) {
      throw ErrorHelper.catch("find areas by suburb id", error);
    }
  }

  static async updateTrackingByShippingId(
    shipping_id: string,
    new_tracking: ShippingTracking
  ) {
    try {
      const trackings_cache = await this.findTrackingByShippingId(shipping_id);

      if (trackings_cache) {
        trackings_cache.push(new_tracking);

        await this.cacheTrackingByShippingId(shipping_id, trackings_cache);
      }
    } catch (error) {
      throw ErrorHelper.catch("update trackings cache by shipping id", error);
    }
  }
}
