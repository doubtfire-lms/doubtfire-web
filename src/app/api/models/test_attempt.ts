export interface TestAttempt {
  id: string;
  name: string;
  attemptNumber: number;
  passStatus: boolean;
  suspendData: string;
  completed: boolean;
  attemptedAt: string;
  cmiEntry: string;
  examResult: string;
}
