import ErrorResponse from "../errors/response.error";
import { PagingHelper } from "../helpers/paging.helper";
import {
  CartByProductName,
  CartDelete,
  CartInput,
} from "../interfaces/cart.interface";
import { CartModelCount } from "../models/cart/count.model";
import { CartModelModify } from "../models/cart/modify.model";
import { CartModelRetrieve } from "../models/cart/retrieve.model";
import { CartValidation } from "../validations/schema/cart.validation";
import validation from "../validations/validation";

export class CartService {
  static async create(data: CartInput) {
    validation(CartValidation.create, data);

    const total_cart_items = await CartModelCount.countByFields({
      user_id: data.user_id,
    });

    if (total_cart_items >= 20) {
      throw new ErrorResponse(400, "sorry, this user already has 20 cart item");
    }

    const cart_item = await CartModelModify.create(data);
    return cart_item;
  }

  static async get(page: number) {
    validation(CartValidation.page, page);

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const carts = await CartModelRetrieve.findMany(limit, offset);

    const total_cart_items = await CartModelCount.count();

    const result = PagingHelper.formatPagedData(
      carts,
      total_cart_items,
      page,
      limit
    );

    return result;
  }

  static async getByUserId(user_id: number) {
    validation(CartValidation.user_id, user_id);

    const cart = await CartModelRetrieve.findManyByUserId(user_id);
    return cart;
  }

  static async getByProductName(data: CartByProductName) {
    validation(CartValidation.getByProductName, data);

    const { limit, offset } = PagingHelper.createLimitAndOffset(data.page);

    const carts = await CartModelRetrieve.findManyByProductName(
      data.product_name,
      limit,
      offset
    );

    const total_cart_items = await CartModelCount.countByProductName(
      data.product_name
    );

    const result = PagingHelper.formatPagedData(
      carts,
      total_cart_items,
      data.page,
      limit
    );

    return result;
  }

  static async deleteByUserAndItemId(data: CartDelete) {
    validation(CartValidation.delete, data);

    await CartModelModify.deleteByUserAndItemId(data);
  }
}
