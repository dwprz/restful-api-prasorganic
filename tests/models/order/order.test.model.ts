import pool from "../../../src/apps/postgresql.app";
import { OrderStatus } from "../../../src/interfaces/order.interface";
import { ProductOrderTestModel } from "../product-order/product-order.test.model";
import { ProductOrderTestSubModel } from "../product-order/sub.test.model";
import { OrderTestSubModel } from "./sub.test.model";

export class OrderTestModel {
  static order = {
    gross_amount: 50000,
    courier: "JNE",
    rate_id: 1,
    rate_name: "REG",
    rate_type: "Regular",
    cod: false,
    use_insurance: true,
    package_type: 3,
    payment_method: "ABC",
    snap_token: "rahasia",
    snap_redirect_url: "rahasia",
    email: "userTest123@gmail.com",
    buyer: "User Test123",
    length: 30,
    width: 15,
    height: 15,
    weight: 5,
    address_owner: "John Doe",
    street: "Gang Kancil no.xx",
    area_id: 4739,
    area: "Ragunan",
    lat: "-6.301752",
    lng: "106.8207875",
    suburb: "Pasar Minggu",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    whatsapp: "08123456789",
  };

  static async create(
    user_id: number,
    order_id: string,
    order_status: OrderStatus,
    product: any
  ) {
    const client = await pool.connect();
    try {
      const order = await OrderTestSubModel.insert(client, {
        ...this.order,
        user_id: user_id,
        order_id: order_id,
        status: order_status,
      });

      let product_order = ProductOrderTestModel.createInstance(product, 2);
      product_order = await ProductOrderTestSubModel.insert(
        client,
        product_order,
        order_id
      );

      return { order, products: [product_order] };
    } catch (error) {
      console.log("order test model create: ", error);
    } finally {
      client.release();
    }
  }

  static async delete(order_id: string) {
    const client = await pool.connect();
    try {
      await ProductOrderTestSubModel.delete(client, order_id);

      await OrderTestSubModel.delete(client, order_id);
    } catch (error) {
      console.log("order test model delete: ", error);
    } finally {
      client.release();
    }
  }
}
