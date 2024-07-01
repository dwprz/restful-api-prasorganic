import { CategoryModelModify } from "../models/category/modify.model";
import { ProductModelRetrieve } from "../models/product/retrieve.model";
import { ProductValidation } from "../validations/schema/product.validation";
import validation from "../validations/validation";

export class CategoryService {
  static async update(data: any) {
    const { product_id, categories, new_categories } = validation(
      ProductValidation.updateCategories,
      data
    );

    await CategoryModelModify.update(categories, new_categories, product_id);

    const product = await ProductModelRetrieve.findWithCategoriesById(
      product_id
    );

    return product;
  }
}
