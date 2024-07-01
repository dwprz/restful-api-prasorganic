import ResponseError from "../errors/response.error";
import {
  ProductWithCategoriesInput,
  ProductQuery,
  ProductUpdate,
  ProductImageUpdate,
} from "../interfaces/product.interface";
import { ProductValidation } from "../validations/schema/product.validation";
import validation from "../validations/validation";
import { ProductModelRetrieve } from "../models/product/retrieve.model";
import { PagingHelper } from "../helpers/paging.helper";
import { FileHelper } from "../helpers/file.helper";
import ErrorResponse from "../errors/response.error";
import { ProductOrderModelRetrieve } from "../models/product-order/retrieve.model";
import { OrderCache } from "../cache/order.cache";
import { ProductModelModify } from "../models/product/modify.model";
import { ProductModelCount } from "../models/product/count.model";

export class ProductService {
  static async create(data: ProductWithCategoriesInput) {
    const { product_name } = validation(ProductValidation.create, data);

    const existing_product = await ProductModelRetrieve.findByFields({
      product_name: product_name,
    });

    if (existing_product) {
      throw new ResponseError(409, "product already exist");
    }

    const product = await ProductModelModify.create(data);
    return product;
  }

  static async getRandom(page: number) {
    page = validation(ProductValidation.page, page);

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const products = await ProductModelRetrieve.findManyRandom(limit, offset);

    const total_products = await ProductModelCount.count();

    const result = PagingHelper.formatPagedData(
      products,
      total_products,
      page,
      limit
    );

    return result;
  }

  static async getByName(data: ProductQuery) {
    const { page, name } = validation(ProductValidation.productQuery, data);

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const products = await ProductModelRetrieve.findManyByName(
      name!,
      limit,
      offset
    );

    const total_products = await ProductModelCount.countByName(name!);

    const result = PagingHelper.formatPagedData(
      products,
      total_products,
      page,
      limit
    );

    return result;
  }

  static async getTop() {
    const products = await ProductModelRetrieve.findManyByFields(
      { is_top_product: true },
      8,
      0
    );

    return products;
  }

  static async getByCategories(data: ProductQuery) {
    const { page, categories } = validation(
      ProductValidation.productQuery,
      data
    );

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const products = await ProductModelRetrieve.findManyByCategories(
      categories!,
      limit,
      offset
    );

    const total_products = await ProductModelCount.countByCategories(
      categories!
    );

    const result = PagingHelper.formatPagedData(
      products,
      total_products,
      page,
      limit
    );

    return result;
  }

  static async getRandomWithCategories(page: number) {
    page = validation(ProductValidation.page, page);

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const products = await ProductModelRetrieve.findManyRandomWithCategories(
      limit,
      offset
    );

    const total_products = await ProductModelCount.count();

    const result = PagingHelper.formatPagedData(
      products,
      total_products,
      page,
      limit
    );

    return result;
  }

  static async getWithCategoriesByCategories(data: ProductQuery) {
    const { page, categories } = validation(
      ProductValidation.productQuery,
      data
    );

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const products =
      await ProductModelRetrieve.findManyWithCategoriesByCategories(
        categories!,
        limit,
        offset
      );

    const total_products = await ProductModelCount.countByCategories(
      categories!
    );

    const result = PagingHelper.formatPagedData(
      products,
      total_products,
      page,
      limit
    );

    return result;
  }

  static async update(data: ProductUpdate) {
    const { product_id, ...product_request } = validation(
      ProductValidation.update,
      data
    );

    if (data.is_top_product === true) {
      const total_products = await ProductModelCount.countByFields({
        is_top_product: true,
      });

      if (total_products >= 8) {
        throw new ErrorResponse(400, "sorry, there are already 8 top products");
      }
    }

    const product = await ProductModelModify.updateById(
      product_request,
      product_id
    );
    return product;
  }

  static async updateImage(data: ProductImageUpdate) {
    const { image, new_image, product_id } = validation(
      ProductValidation.updateImage,
      data
    );

    if (image) {
      FileHelper.deleteByUrl(image);
    }

    const product = await ProductModelModify.updateById(
      { image: new_image },
      product_id
    );

    return product;
  }

  static async rollbackStocks(order_id: string) {
    const order_cache = await OrderCache.findById(order_id);

    let products_order = order_cache?.products;

    if (!order_cache) {
      products_order = await ProductOrderModelRetrieve.findManyById(order_id);
    }

    await ProductModelModify.rollbackStocks(products_order!);
  }

  static async delete(product_id: number) {
    product_id = validation(ProductValidation.ptoduct_id, product_id);

    await ProductModelModify.delete(product_id);
  }
}
