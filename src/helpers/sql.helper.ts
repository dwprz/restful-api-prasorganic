import { string } from "zod";
import ErrorResponse from "../error/response.error";

export class SqlHelper {
  // method untuk mendapatkan nama field nya
  static getFieldNames(fields: Record<string, any>) {
    if (Array.isArray(fields)) {
      throw new ErrorResponse(400, "fields must be an object, not an array");
    }

    const field_names = Object.keys(fields).join(", ");
    return field_names;
  }

  // method untuk mendapatkan nilai field nya jika type nya object atu array
  static getFieldValues(fields: Record<string, any> | Record<string, any>[]) {
    if (
      Array.isArray(fields) &&
      fields.every((field) => typeof field === "object")
    ) {
      const field_values = fields.flatMap((value) => Object.values(value));
      return field_values;
    }

    if (
      Array.isArray(fields) &&
      fields.every((field) => typeof field !== "object")
    ) {
      return fields;
    }

    const field_values = Object.values(fields);
    return field_values;
  }

  // method untuk membuat where clause
  static buildWhereClause(fields: Record<string, any>) {
    if (Array.isArray(fields)) {
      throw new ErrorResponse(400, "fields must be an object, not an array");
    }

    const where_clause = Object.keys(fields)
      .map((field, i) => `${field} = $${i + 1}`)
      .join(" AND ");

    return where_clause;
  }

  // method untuk membuat set clause
  static buildSetClause(fields: Record<string, any>) {
    if (Array.isArray(fields)) {
      throw new ErrorResponse(400, "fields must be an object, not an array");
    }

    const set_clause = Object.keys(fields)
      .map((field, i) => `${field} = $${i + 1}`)
      .join(", ");

    return set_clause;
  }

  // method untuk membuat query parameter
  static buildParameterizedQueries(fields: Record<string, any> | any[]) {
    if (
      Array.isArray(fields) &&
      fields.every((field) => typeof field === "object")
    ) {
      throw new ErrorResponse(400, "fields must object, not array object");
    }

    const parameterized_queries = Object.keys(fields)
      .map((_, i) => `$${i + 1}`)
      .join(", ");

    return parameterized_queries;
  }

  // method untuk membuat placeholder values
  static buildValuesPlaceholders(fields: any) {
    if (
      Array.isArray(fields) &&
      fields.every(
        (field) => typeof field !== "object" && !Array.isArray(field)
      )
    ) {
      const placeholders = fields.map((_, i) => `( $${i + 1} )`).join(", ");
      return placeholders;
    }

    if (typeof fields === "object" && !Array.isArray(fields)) {
      fields = [fields];
    }

    if (typeof fields !== "object" && !Array.isArray(fields)) {
      const placeholders = "( $1 )";
      return placeholders;
    }

    let increase = 1;

    const placeholders = (fields as Record<string, any>[])
      .map((field) => {
        return `(${Object.keys(field)
          .map(() => `$${increase++}`)
          .join(", ")})`;
      })
      .join(", ");

    return placeholders;
  }
}
