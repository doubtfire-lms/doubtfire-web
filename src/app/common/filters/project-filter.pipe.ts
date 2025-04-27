import {Pipe, PipeTransform} from '@angular/core';
import {Project} from 'src/app/api/models/project';

@Pipe({
  name: 'projectFilter',
})
export class ProjectFilterPipe implements PipeTransform {
  transform(input: Project[], text: string): Project[] {
    if (text && text.length > 0 && input) {
      const matchText = text.toLowerCase();
      return input.filter((project) => project?.matches(matchText));
    }
    return input;
  }
}
