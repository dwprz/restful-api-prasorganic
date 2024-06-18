import { AddressInput, AddressUpdate } from "../interfaces/address.interface";
import validation from "../validations/validation";
import { AddressValidation } from "../validations/schema/address.validation";
import { AddressUtil } from "../utils/address.util";

export class AddressService {
  static async create(data: AddressInput) {
    validation(AddressValidation.create, data);

    const address = await AddressUtil.create(data);
    return address;
  }

  static async get(user_id: number) {
    validation(AddressValidation.user_id, user_id);

    const addresses = await AddressUtil.findManyByUserId(user_id);
    return addresses;
  }

  static async update(data: AddressUpdate) {
    validation(AddressValidation.update, data);

    const address = await AddressUtil.updateById(data);
    return address;
  }

  static async delete(address_id: number) {
    validation(AddressValidation.address_id, address_id);

    await AddressUtil.deleteById(address_id);
  }
}

