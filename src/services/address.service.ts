// import prismaClient from "../apps/database.app";
// import ResponseError from "../error/response.error";
// import { AddressInput, AddressUpdateInput } from "../interfaces/address";
// import { addressValidation } from "../validations/address.validation";
// import validation from "../validations/validation";

// const create = async (data: AddressInput) => {
//   data = validation(addressValidation.create, data);

//   try {
//     await prismaClient.$queryRaw`BEGIN TRANSACTION;`;

//     if (data.is_main_address) {
//       await prismaClient.address.updateMany({
//         where: {
//           user_id: data.user_id,
//           is_main_address: true,
//         },
//         data: {
//           is_main_address: false,
//         },
//       });
//     }

//     const address = await prismaClient.address.create({
//       data: data,
//     });

//     await prismaClient.$queryRaw`COMMIT TRANSACTION;`;
//     return address;
//   } catch (error) {
//     await prismaClient.$queryRaw`ROLLBACK TRANSACTION;`;
//     throw new ResponseError(400, "failed to create address");
//   }
// };

// const get = async (user_id: number) => {
//   try {
//     const addresses = await prismaClient.address.findMany({
//       where: {
//         user_id: user_id,
//       },
//     });

//     return addresses;
//   } catch (error) {
//     throw new ResponseError(400, "failed get addresses");
//   }
// };

// const update = async (data: AddressUpdateInput) => {
//   const { address_id, user_id } = validation(addressValidation.update, data);

//   try {
//     await prismaClient.$queryRaw`BEGIN TRANSACTION;`;

//     if (data.is_main_address) {
//       await prismaClient.address.updateMany({
//         where: {
//           user_id: data.user_id,
//           is_main_address: true,
//         },
//         data: {
//           is_main_address: false,
//         },
//       });
//     }

//     await prismaClient.address.update({
//       where: {
//         address_id: address_id,
//         user_id: user_id,
//       },
//       data: data,
//     });

//     const addresses = await prismaClient.address.findMany({
//       where: {
//         user_id: user_id,
//       },
//     });

//     await prismaClient.$queryRaw`COMMIT TRANSACTION;`;
//     return addresses;
//   } catch (error) {
//     await prismaClient.$queryRaw`ROLLBACK TRANSACTION;`;
//     console.log(error);
//     throw new ResponseError(400, "failed to update address");
//   }
// };

// const remove = async (user_id: number, address_id: number) => {
//   try {
//     await prismaClient.address.delete({
//       where: {
//         address_id: address_id,
//         user_id: user_id,
//       },
//     });

//     return "success delete address";
//   } catch (error) {
//     throw new ResponseError(400, "failed to delete address");
//   }
// };

// export const addressService = {
//   create,
//   get,
//   update,
//   remove,
// };
