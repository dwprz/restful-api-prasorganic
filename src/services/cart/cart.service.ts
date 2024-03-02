import prismaClient from "../../applications/database";
import { cartValidate } from "../../validations/cart.validation";
import validation from "../../validations/validation";

const create = async (data: any) => {
  data = validation(cartValidate, data);

  data = await prismaClient.cart.findMany({
    where: {
      username: data.username,
      product_id: data.product_id,
    },
    select: {
      id: true,
    },
  });

  if (data.length >= 1) {
    const res = update(data);
    return res;
  }

  const cart = await prismaClient.cart.create({
    data: data,
    select: {
      product: true,
    },
  });

  return cart;
};

const update = async (data: any) => {
  data = await prismaClient.cart.update({
    where: {
      id: data.id,
    },
    data: {
      quantity: data.quantity,
      total_price: data.total_price,
    },
  });

  return data;
};

export const cartService = {
  create,
  update,
};
