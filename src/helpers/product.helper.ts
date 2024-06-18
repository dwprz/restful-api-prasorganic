import { Product } from "../interfaces/product.interface";

export class ProductHelper {
  static transformWithCategories(products: Product[]): Product[] {
    let dummy_products: any = {};

    let result: Product[] = [];

    products.forEach((product) => {
      if (!dummy_products[product.product_id]) {
        dummy_products[product.product_id] = { ...product, categories: [] };

        result.push(dummy_products[product.product_id]);
      }

      dummy_products[product.product_id].categories.push(product.categories);
    });

    return result;
  }
}
