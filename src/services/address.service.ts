import { AddressInput, AddressUpdate } from "../interfaces/address.interface";
import validation from "../validations/validation";
import { AddressValidation } from "../validations/schema/address.validation";
import { AddressModelRetrieve } from "../models/address/retrieve.model";
import { AddressModelModify } from "../models/address/modify.model";

export class AddressService {
  static async create(data: AddressInput) {
    validation(AddressValidation.create, data);

    const address = await AddressModelModify.create(data);
    return address;
  }

  static async get(user_id: number) {
    validation(AddressValidation.user_id, user_id);

    const addresses = await AddressModelRetrieve.findManyByUserId(user_id);
    return addresses;
  }

  static async update(data: AddressUpdate) {
    validation(AddressValidation.update, data);

    const address = await AddressModelModify.updateById(data);
    return address;
  }

  static async delete(address_id: number) {
    validation(AddressValidation.address_id, address_id);

    await AddressModelModify.deleteById(address_id);
  }
}
