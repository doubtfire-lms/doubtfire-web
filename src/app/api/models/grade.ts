export class Grade {
  public static readonly PASS_RANGE: number[] = [0, 1, 2, 3];
  public static readonly FULL_RANGE: number[] = [-1, 0, 1, 2, 3];

  public static readonly GRADE_ACRONYMS: Map<string | number, string> = new Map<string | number, string>([
    ['Fail', 'F'],
    ['Pass', 'P'],
    ['Credit', 'C'],
    ['Distinction', 'D'],
    ['High Distinction', 'HD'],
    [-1, 'F'],
    [0, 'P'],
    [1, 'C'],
    [2, 'D'],
    [3, 'HD'],
  ]);

  public static readonly GRADES: string[] = ['Pass', 'Credit', 'Distinction', 'High Distinction'];

  static {
    Grade.GRADES[-1] = 'Fail';
  }
}
