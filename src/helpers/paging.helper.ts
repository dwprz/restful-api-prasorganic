export class PagingHelper {
  static createLimitAndOffset(page: number) {
    const limit = 20;
    const offset = (page - 1) * limit;

    return { limit, offset };
  }

  static formatPagedData<T>(
    data: T,
    total_data: number,
    page: number,
    limit: number
  ) {
    return {
      data: data,
      paging: {
        total_data: total_data,
        page: page,
        total_page: Math.ceil(total_data / limit),
      },
    };
  }
}
