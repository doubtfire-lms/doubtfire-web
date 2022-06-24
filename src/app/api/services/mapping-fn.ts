export class MappingFunctions {
  public static mapDateToEndOfDay(data, key, entity, params?) {
    const jsonDate = new Date(data[key]);
    return new Date(jsonDate.getFullYear(), jsonDate.getMonth(), jsonDate.getDate(), 23, 59, 59, 999);
  }

  public static mapDateToDay(data, key, entity, params?) {
    const jsonDate = new Date(data[key]);
    return new Date(jsonDate.getFullYear(), jsonDate.getMonth(), jsonDate.getDate());
  }

  public static mapDate(data, key, entity, params?) {
    return new Date(data[key]);
  }
}
