import prismaClient from "../../applications/database";
import ResponseError from "../../error/error";
import { Query } from "../../types/product.types";
import { productValidate } from "../../validations/product.validation";
import validation from "../../validations/validation";
import { searchCategory, searchProducts } from "./product.util";

const create = async (data: any) => {
  data = validation(productValidate.create, data);

  const productCount = await prismaClient.product.count({
    where: { name: data.name },
  });

  if (productCount >= 1) {
    throw new ResponseError(400, "Product already exists");
  }

  const createdProduct = await prismaClient.$transaction(async (prisma) => {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        image: data.image,
        category: data.category,
        initial_price: data.initial_price,
        stock: data.stock,
        description: data.description || "",
      },
    });

    await Promise.all(
      data.tags.map((tag: string) => {
        return prisma.tag.create({
          data: {
            name: tag,
            id_product: product.id,
          },
        });
      })
    );

    return product;
  });

  return createdProduct;
};

const get = async (query: Query) => {
  query = validation(productValidate.get, query);

  if (query.search) {
    return await searchProducts(query);
  }

  if (query.category) {
    return await searchCategory(query);
  }

  const take = 16;
  const skip = (query.page - 1) * take;

  const products = await prismaClient.product.findMany({
    take,
    skip,
  });

  if (products.length === 0) {
    throw new ResponseError(404, "Products not found");
  }

  const totalProducts = await prismaClient.product.count();

  const totalPages = Math.ceil(totalProducts / take);

  return {
    products,
    category: query.category,
    paging: {
      page: query.page,
      total_page: totalPages,
      total_products: totalProducts,
    },
  };
};

export const productService = {
  create,
  get,
};
