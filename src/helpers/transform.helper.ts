import { CartDetails } from "../interfaces/cart.interface";
import { OrderWithProducts } from "../interfaces/order.interface";
import { Product } from "../interfaces/product.interface";

export class TransformHelper {
  static products(products: Product[]): Product[] {
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

  static orders(orders: any[]) {
    if (!orders.length) {
      return [];
    }

    let dummy_orders: any = {};

    for (const order of orders) {
      if (!dummy_orders[order.order_id]) {
        dummy_orders[order.order_id] = {
          order: {
            order_id: order.order_id,
            gross_amount: order.gross_amount,
            status: order.status,

            shipping_id: order.shipping_id,
            courier: order.courier,
            rate_id: order.rate_id,
            rate_name: order.rate_name,
            rate_type: order.rate_type,
            cod: order.cod,
            use_insurance: order.use_insurance,
            package_type: order.package_type,

            payment_method: order.payment_method,
            snap_token: order.snap_token,
            snap_redirect_url: order.snap_redirect_url,

            user_id: order.user_id,
            email: order.email,
            buyer: order.buyer,

            length: order.length,
            width: order.width,
            height: order.height,
            weight: order.weight,

            address_owner: order.address_owner,
            street: order.street,
            area_id: order.area_id,
            area: order.area,
            lat: order.lat,
            lng: order.lng,
            suburb: order.suburb,
            city: order.city,
            province: order.provice,
            whatsapp: order.whatsapp,

            created_at: order.created_at,
            updated_at: order.updated_at,
          },

          products: [],
        };

        dummy_orders[order.order_id].products.push({
          product_order_id: order.product_order_id,
          order_id: order.order_id,
          product_id: order.product_id,
          product_name: order.product_name,
          image: order.image,
          price: order.price,
          quantity: order.quantity,
          total_gross_price: order.total_gross_price,
        });
      }
    }

    return Object.values(dummy_orders) as OrderWithProducts[];
  }

  static carts(carts: any) {
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
