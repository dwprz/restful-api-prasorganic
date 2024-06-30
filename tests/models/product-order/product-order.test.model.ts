export class ProductOrderTestModel {
  static createInstance(product: any, quantity: number) {
    const product_order = {
      product_id: product.product_id,
      product_name: product.product_name,
      image: product.image,
      price: product.price,
      quantity: quantity,
      total_gross_price: quantity * product.price,
    };

    return product_order;
  }
}
