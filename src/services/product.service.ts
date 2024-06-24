import ResponseError from "../errors/response.error";
import {
  ProductInput,
  ProductQuery,
  ProductUpdate,
  ProductImageUpdate,
} from "../interfaces/product.interface";
import { ProductValidation } from "../validations/schema/product.validation";
import validation from "../validations/validation";
import { ProductUtil } from "../utils/product.util";
import { PagingHelper } from "../helpers/paging.helper";
import { FileHelper } from "../helpers/file.helper";
import { CategoryUtil } from "../utils/category.util";
import ErrorResponse from "../errors/response.error";
import { ProductOrderUtil } from "../utils/product-order.util";
import { OrderCache } from "../cache/order.cache";

export class ProductService {
  static async create(data: ProductInput) {
    const { product_name } = validation(ProductValidation.create, data);

    const existing_product = await ProductUtil.findByFields({
      product_name: product_name,
    });

    if (existing_product) {
      throw new ResponseError(409, "product already exist");
    }

    const product = await ProductUtil.createWithCategories(data);
    return product;
  }

  static async getRandom(page: number) {
    page = validation(ProductValidation.page, page);

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const products = await ProductUtil.findManyRandom(limit, offset);

    const total_products = await ProductUtil.count();

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

    const products = await ProductUtil.findManyByName(name!, limit, offset);
    const total_products = await ProductUtil.countByName(name!);

    const result = PagingHelper.formatPagedData(
      products,
      total_products,
      page,
      limit
    );

    return result;
  }

  static async getTop() {
    const products = await ProductUtil.findManyByFields(
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

    const products = await ProductUtil.findManyByCategories(
      categories!,
      limit,
      offset
    );

    const total_products = await ProductUtil.countByCategories(categories!);

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

    const products = await ProductUtil.findManyRandomWithCategories(
      limit,
      offset
    );

    const total_products = await ProductUtil.count();

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

    const products = await ProductUtil.findManyWithCategoriesByCategories(
      categories!,
      limit,
      offset
    );

    const total_products = await ProductUtil.countByCategories(categories!);

    const result = PagingHelper.formatPagedData(
      products,
      total_products,
      page,
      limit
    );

    return result;
  }

  static async getDeleted(page: number) {
    validation(ProductValidation.page, page);

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const products = await ProductUtil.findManyDeleted(limit, offset);
    const total_products = await ProductUtil.countDeleted();

    const result = PagingHelper.formatPagedData(
      products,
      total_products,
      page,
      limit
    );

    return result;
  }

  static async restore(product_id: number) {
    validation(ProductValidation.ptoduct_id, product_id);

    const product = await ProductUtil.restore(product_id);
    return product;
  }

  static async update(data: ProductUpdate) {
    const { product_id, ...product_request } = validation(
      ProductValidation.update,
      data
    );

    if (data.is_top_product) {
      const total_products = await ProductUtil.countByFields({
        is_top_product: true,
      });

      if (total_products >= 8) {
        throw new ErrorResponse(400, "sorry, there are already 8 top products");
      }
    }

    const product = await ProductUtil.updateById(product_request, product_id);
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

    const product = await ProductUtil.updateById(
      { image: new_image },
      product_id
    );

    return product;
  }

  static async updateCategories(data: any) {
    const { product_id, categories, new_categories } = validation(
      ProductValidation.updateCategories,
      data
    );

    await CategoryUtil.update(categories, new_categories, product_id);

    const product = await ProductUtil.findWithCategoriesById(product_id);

    return product;
  }

  static async rollbackStocks(order_id: string) {
    const order_cache = await OrderCache.findById(order_id);

    let products_order = order_cache?.products;

    if (!order_cache) {
      products_order = await ProductOrderUtil.findManyById(order_id);
    }

    await ProductUtil.rollbackStocks(products_order!);
  }

  static async delete(product_id: number) {
    product_id = validation(ProductValidation.ptoduct_id, product_id);

    await ProductUtil.delete(product_id);
  }
}
