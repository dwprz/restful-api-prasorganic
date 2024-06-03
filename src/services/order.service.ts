// import prismaClient from "../apps/database.app";
// import ResponseError from "../error/response.error";
// import { OrderInput, OrderUpdateStatus } from "../interfaces/order";
// import { orderValidation } from "../validations/order.validation";
// import validation from "../validations/validation";

// const create = async (data: OrderInput) => {
//   const { order, products } = validation(orderValidation.create, data);

//   try {
//     await prismaClient.$queryRaw`BEGIN TRANSACTION`;

//     const resOrder = await prismaClient.order.create({
//       data: order,
//     });

//     const { order_id } = resOrder;

//     const resProducts = await prismaClient.productOrderHistori.createMany({
//       data: products.map((product) => ({ ...product, order_id: order_id })),
//     });

//     await prismaClient.$queryRaw`COMMIT TRANSACTION`;

//     return { ...resOrder, products: resProducts };
//   } catch (error) {
//     await prismaClient.$queryRaw`ROLLBACK TRANSACTION`;
//   }
// };

// const getByUser = async (user_id: number) => {
//   const orders = await prismaClient.order.findMany({
//     where: {
//       user_id: user_id,
//     },
//   });

//   if (!orders.length) {
//     throw new ResponseError(404, "orders not found");
//   }

//   return orders;
// };

// const updateStatus = async (data: OrderUpdateStatus) => {
//   const { order_id, status } = validation(orderValidation.updateStatus, data);

//   await prismaClient.order.update({
//     where: {
//       order_id: order_id,
//     },
//     data: {
//       status: status,
//     },
//   });
// };

// export const orderService = {
//   create,
//   getByUser,
//   updateStatus,
// };
