import prismaClient from "../../src/apps/database/db";

const remove = async () => {
  await prismaClient.address.deleteMany({});
};


export const addressUtil = {
  remove,
};
