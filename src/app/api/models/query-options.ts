export interface QueryBuilder {
  toQueryMap: () => Map<string, string>;
  toQueryString: () => string;
}

export class QueryOptions implements QueryBuilder {
  public pageNumber: number;
  public pageSize: number;

  constructor() {
    this.pageNumber = 1;
    this.pageSize = 10000;
  }

  toQueryMap() {
    const queryMap = new Map<string, string>();
    queryMap.set('pageNumber', `${this.pageNumber}`);
    queryMap.set('pageSize', `${this.pageSize}`);

    return queryMap;
  }

  toQueryString() {
    let queryString = '';
    this.toQueryMap().forEach((value: string, key: string) => {
      queryString = queryString.concat(`${key}=${value}&`);
    });

    return queryString.substring(0, queryString.length - 1);
  }
}
