import fs from "fs";
import ErrorResponse from "../error/response.error";
import fileType from "file-type";
import "dotenv/config";
import { EnvHelper } from "./env.helper";

export class FileHelper {
  static deleteByUrl(url: string | undefined) {
    if (!url) {
      throw new ErrorResponse(400, "url is undefined");
    }

    const main_folder = url.split("/")[3];
    const sub_folder = url.split("/")[4];
    const file_name = url.split("/")[5];

    const path =
      process.cwd() + `/public/${main_folder}/${sub_folder}/${file_name}`;

    this.deleteByPath(path);
  }

  static deleteByPath(path: string | undefined) {
    if (!path) {
      throw new ErrorResponse(400, "path is undefined");
    }

    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }

  static async validateImageWithMagicNumber(
    file: Express.Multer.File | undefined
  ) {
    if (!file) {
      throw new ErrorResponse(400, "file is undifined");
    }

    const buffer = fs.readFileSync(file.path);
    const type = await fileType.fromBuffer(buffer); // mendapatkan type mime berdasarkan magic number nya

    if (!type) {
      throw new ErrorResponse(400, "file type is undifined");
    }

    if (type.mime !== "image/jpeg" && type.mime !== "image/png") {
      throw new ErrorResponse(400, "the file is not in jpeg or png format");
    }
  }

  static formatUrl(
    mainFolder: string,
    subFolder: string,
    filename: string | undefined
  ) {
    if (!filename) {
      throw new ErrorResponse(400, "filename is undefined");
    }

    const APP_PROTOCOL = process.env.APP_PROTOCOL;
    const APP_HOST = process.env.APP_HOST;
    const APP_PORT = process.env.APP_PORT;

    EnvHelper.validate({ APP_PROTOCOL, APP_HOST, APP_PORT });

    const url = `${APP_PROTOCOL}://${APP_HOST}:${APP_PORT}/${mainFolder}/${subFolder}/${filename}`;
    return url;
  }
}
