import prismaClient from "../../src/apps/database/db";

const remove = async () => {
  await prismaClient.cart.deleteMany();
};

export const cartUtil = {
  remove,
};
