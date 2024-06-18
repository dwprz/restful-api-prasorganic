import "dotenv/config";
import { EnvHelper } from "../helpers/env.helper";
import axios from "axios";
import validation from "../validations/validation";
import { RajaOngkirValidation } from "../validations/schema/raja-ongkir.validation";
import { RajaOngkirUtil } from "../utils/raja-ongkir.util";
import ErrorResponse from "../error/response.error";
import {
  City,
  Province,
  shippingRateCreate,
  Subdistrict,
  Waybill,
} from "../interfaces/raja-ongkir.interface";

export class RajaOngkirService {
  static async createShippingRate(queries: shippingRateCreate) {
    const API_KEY_RAJA_ONGKIR = process.env.API_KEY_RAJA_ONGKIR;

    EnvHelper.validate({ API_KEY_RAJA_ONGKIR });

    try {
      const { data } = await axios.post(
        "https://pro.rajaongkir.com/api/cost",
        queries,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            key: API_KEY_RAJA_ONGKIR,
          },
        }
      );

      return data.rajaongkir.results[0];
    } catch (error) {
      throw new ErrorResponse(400, "failed to create shipping rate");
    }
  }

  static async createWaybillByNumberAndCourier(
    waybill_number: string,
    courier: string
  ) {
    const API_KEY_RAJA_ONGKIR = process.env.API_KEY_RAJA_ONGKIR;

    EnvHelper.validate({ API_KEY_RAJA_ONGKIR });

    try {
      const { data } = await axios.post(
        "https://pro.rajaongkir.com/api/waybill",
        { waybill: waybill_number, courier: courier },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            key: API_KEY_RAJA_ONGKIR,
          },
        }
      );

      const { delivered, manifest } = data.rajaongkir.result;

      return { delivered, manifest };
    } catch (error) {
      throw new ErrorResponse(400, "failed to create waybill");
    }
  }

  static async cacheProvinces(provinces: Province[]) {
    validation(RajaOngkirValidation.provinces, provinces);

    await RajaOngkirUtil.cacheProvinces(provinces);
  }

  static async cacheCitiesByProvinceId(province_id: string, cities: City[]) {
    validation(RajaOngkirValidation.cities, cities);

    await RajaOngkirUtil.cacheCitiesByProvinceId(province_id, cities);
  }

  static async cacheSubdistrictsByCityId(
    city_id: string,
    subdistricts: Subdistrict[]
  ) {
    validation(RajaOngkirValidation.subdistricts, subdistricts);

    await RajaOngkirUtil.cacheSubdistrictsByCityId(city_id, subdistricts);
  }

  static async cacheWaybillByNumberAndCourier(
    waybill_number: string,
    courier: string,
    waybill: Waybill
  ) {
    validation(RajaOngkirValidation.waybill, waybill);

    await RajaOngkirUtil.cacheWaybillByNumberAndCourier(
      waybill_number,
      courier,
      waybill
    );
  }

  static async getProvinces() {
    const API_KEY_RAJA_ONGKIR = process.env.API_KEY_RAJA_ONGKIR;

    EnvHelper.validate({ API_KEY_RAJA_ONGKIR });

    try {
      const { data } = await axios.get(
        "https://pro.rajaongkir.com/api/province",
        {
          headers: {
            key: API_KEY_RAJA_ONGKIR,
          },
        }
      );

      return data.rajaongkir.results;
    } catch (error) {
      throw new ErrorResponse(400, "failed to get provinces");
    }
  }

  static async getCitiesByProvinceId(province_id: string) {
    validation(RajaOngkirValidation.province_id, province_id);

    const API_KEY_RAJA_ONGKIR = process.env.API_KEY_RAJA_ONGKIR;

    EnvHelper.validate({ API_KEY_RAJA_ONGKIR });

    try {
      const { data } = await axios.get(
        `https://pro.rajaongkir.com/api/city?province=${province_id}`,
        {
          headers: {
            key: API_KEY_RAJA_ONGKIR,
          },
        }
      );

      return data.rajaongkir.results;
    } catch (error) {
      throw new ErrorResponse(400, "failed to get cities by province id");
    }
  }

  static async getSubdistrictsByCityId(city_id: string) {
    validation(RajaOngkirValidation.city_id, city_id);

    const API_KEY_RAJA_ONGKIR = process.env.API_KEY_RAJA_ONGKIR;

    EnvHelper.validate({ API_KEY_RAJA_ONGKIR });

    try {
      const { data } = await axios.get(
        `https://pro.rajaongkir.com/api/subdistrict?city=${city_id}`,
        {
          headers: {
            key: API_KEY_RAJA_ONGKIR,
          },
        }
      );

      return data.rajaongkir.results;
    } catch (error) {
      throw new ErrorResponse(400, "failed to get subdistricts by city id");
    }
  }
}
