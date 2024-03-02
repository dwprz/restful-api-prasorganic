import prismaClient from "../../src/applications/database";

const remove = async () => {
  await prismaClient.product.deleteMany({
    where: { name: "productTest" },
  });
};

export const utilProduct = {
  remove,
};
