import prismaClient from "../../src/apps/database.app";

const remove = async () => {
  await prismaClient.productOrderHistori.deleteMany({});
  await prismaClient.order.deleteMany({});
};

export const orderUtil = {
  remove,
};
