import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'outcomeFilter',
})
export class OutcomeFilterPipe implements PipeTransform {
  transform(input: any[], outcomeId: string): any[] {
    if (!input || !outcomeId) {
      return input;
    }

    return input.filter((item) => item?.learningOutcome?.id === outcomeId);
  }
}
