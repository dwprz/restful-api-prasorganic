import { PagingHelper } from "../helpers/paging.helper";
import { DeletedProductModelCount } from "../models/deleted-product/count.model";
import { DeletedProductModelRetrieve } from "../models/deleted-product/retrieve.model";
import { ProductModelModify } from "../models/product/modify.model";
import { ProductValidation } from "../validations/schema/product.validation";
import validation from "../validations/validation";

export class DeletedProductService {
  static async get(page: number) {
    validation(ProductValidation.page, page);

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const products = await DeletedProductModelRetrieve.findMany(limit, offset);
    const total_products = await DeletedProductModelCount.count();

    const result = PagingHelper.formatPagedData(
      products,
      total_products,
      page,
      limit
    );

    return result;
  }

  static async restore(product_id: number) {
    validation(ProductValidation.ptoduct_id, product_id);

    const product = await ProductModelModify.restore(product_id);
    return product;
  }
}
