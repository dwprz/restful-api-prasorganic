import ErrorResponse from "../errors/response.error";
import { PagingHelper } from "../helpers/paging.helper";
import { CartByProductName, CartDelete, CartInput } from "../interfaces/cart.interface";
import { CartUtil } from "../utils/cart.util";
import { CartValidation } from "../validations/schema/cart.validation";
import validation from "../validations/validation";

export class CartService {
  static async create(data: CartInput) {
    validation(CartValidation.create, data);

    const total_cart_items = await CartUtil.countByFields({
      user_id: data.user_id,
    });

    if (total_cart_items >= 20) {
      throw new ErrorResponse(400, "sorry, this user already has 20 cart item");
    }

    const cart_item = await CartUtil.create(data);
    return cart_item;
  }

  static async get(page: number) {
    validation(CartValidation.page, page);

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const carts = await CartUtil.findMany(limit, offset);

    const total_cart_items = await CartUtil.count();

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

    const cart = await CartUtil.findManyByUserId(user_id);
    return cart;
  }

  static async getByProductName(data: CartByProductName) {
    validation(CartValidation.getByProductName, data);

    const { limit, offset } = PagingHelper.createLimitAndOffset(data.page);

    const carts = await CartUtil.findManyByProductName(
      data.product_name,
      limit,
      offset
    );

    const total_cart_items = await CartUtil.countByProductName(
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

    await CartUtil.deleteByUserAndItemId(data);
  }
}
