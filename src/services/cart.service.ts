// import prismaClient from "../apps/database.app";
// import ResponseError from "../error/response.error";
// import { CartInput, CartOutput } from "../interfaces/cart";
// import { cartValidation } from "../validations/cart.validation";
// import validation from "../validations/validation";

// const create = async (data: CartInput) => {
//   const { user_id, product_id } = validation(cartValidation.create, data);

//   const findCart = await prismaClient.cart.findFirst({
//     where: {
//       user_id: user_id,
//       product_id: product_id,
//     },
//   });

//   if (findCart) return;

//   const cart = await prismaClient.cart.create({
//     data: data,
//   });

//   return cart;
// };

// const get = async (user_id: number): Promise<CartOutput[]> => {
//   const cart = await prismaClient.cart.findMany({
//     where: {
//       user_id: user_id,
//     },
//   });

//   return cart;
// };

// const remove = async (user_id: number, cart_id: number) => {
//   try {
//     await prismaClient.cart.delete({
//       where: {
//         cart_id: cart_id,
//         user_id: user_id,
//       },
//     });

//     return "success remove cart";
//   } catch (error) {
//     throw new ResponseError(400, "failed to remove cart");
//   }
// };

// export const cartService = {
//   create,
//   get,
//   remove,
// };
