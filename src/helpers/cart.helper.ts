import { CartDetails } from "../interfaces/cart.interface";

export class CartHelper {
  static transform(carts: any) {
    if (!carts.length) {
      return [];
    }

    let dummy_carts: any = {};

    carts.forEach((item: any) => {
      if (!dummy_carts[item.product_id]) {
        dummy_carts[item.product_id] = {
          product: {
            product_id: item.product_id,
            product_name: item.product_name,
            image: item.image,
            rate: item.rate,
            sold: item.sold,
            price: item.price,
            stock: item.stock,
            length: item.lenth,
            width: item.width,
            height: item.height,
            weight: item.weight,
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at,
          },
          total_quantity: 0,
          sum_total_gross_price: 0,
          cart: [],
        };
      }

      dummy_carts[item.product_id].total_quantity += item.quantity;

      dummy_carts[item.product_id].sum_total_gross_price +=
        item.total_gross_price;

      dummy_carts[item.product_id].cart.push({
        user: {
          user_id: item.user_id,
          email: item.email,
          photo_profile: item.photo_profile,
          role: item.role,
        },
        quantity: item.quantity,
        total_gross_price: item.total_gross_price,
      });
    });

    const result: CartDetails[] = Object.values(dummy_carts);

    return result;
  }
}
