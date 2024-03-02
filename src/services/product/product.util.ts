import prismaClient from "../../applications/database";
import ResponseError from "../../error/error";
import { Query } from "../../types/product.types";

export const searchProducts = async (query: Query) => {
  const { search, page } = query;
  const take = 16;
  const skip = (page - 1) * take;

  if (!search) {
    throw new Error("Search query is required");
  }

  const tagNames = Array.isArray(search) ? search.slice(0, 3) : [search];

  const products = await prismaClient.product.findMany({
    where: {
      Tag: {
        some: {
          name: { in: tagNames },
        },
      },
    },
    take,
    skip,
  });

  const productsWithCount: any[] = await Promise.all(
    products.map(async (product) => {
      const count = await prismaClient.tag.count({
        where: {
          id_product: product.id,
          name: { in: tagNames },
        },
      });
      return { ...product, tagCount: count };
    })
  );

  const sortedProducts = productsWithCount.sort(
    (a: any, b: any) => b.tagCount - a.tagCount
  );

  const totalProducts = await prismaClient.product.count({
    where: {
      Tag: {
        some: {
          name: { in: tagNames },
        },
      },
    },
  });

  const totalPages = Math.ceil(totalProducts / take);

  return {
    products: sortedProducts,
    search,
    paging: {
      page,
      total_page: totalPages,
      total_products: totalProducts,
    },
  };
};

export const searchCategory = async (query: Query) => {
  const { category, page } = query;
  const take = 16;
  const skip = (page - 1) * take;

  const products = await prismaClient.product.findMany({
    where: { category },
    take,
    skip,
  });

  if (products.length === 0) {
    throw new ResponseError(404, "Products not found");
  }

  const totalProducts = await prismaClient.product.count({
    where: { category },
  });

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
