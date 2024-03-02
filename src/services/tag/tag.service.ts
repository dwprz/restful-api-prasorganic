import prismaClient from "../../applications/database";
import ResponseError from "../../error/error";

const create = async (data: any) => {
  const tagCount = await prismaClient.tag.count({
    where: {
      name: data.name,
      id_product: data.id,
    },
  });

  if (tagCount >= 1) throw new ResponseError(400, "tag duplicate");

  const res = await prismaClient.tag.create({
    data: data,
  });

  return res;
};

export const tagService = {
  create,
};
