import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Project} from 'src/app/api/models/project';
import {TaskStatusEnum} from 'src/app/api/models/task-status';
import {Unit} from 'src/app/api/models/unit';
import {TaskService} from 'src/app/api/services/task.service';

@Component({
  selector: 'f-portfolios-list',
  templateUrl: './portfolios-list.component.html',
  styleUrl: './portfolios-list.component.scss',
})
export class PortfoliosListComponent implements OnInit, AfterViewInit {
  constructor(private taskService: TaskService) {}
  @Input() unit: Unit;

  @Output()
  public studentSelected = new EventEmitter<Project>();

  displayedColumns: string[] = [
    'student',
    'name',
    'tutor',
    'tutorial',
    'target',
    'submitted-as',
    'stats',
    'grade',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<Project>([]);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    console.log(this.unit);
    this.dataSource.data = [...this.unit.students];
  }

  selectStudent(project: Project) {
    this.studentSelected.emit(project);
  }

  public statusColor(status: TaskStatusEnum): string {
    return this.taskService.statusColors.get(status);
  }

  public statusLabel(status: TaskStatusEnum): string {
    return this.taskService.statusLabels.get(status);
  }

  private sortCompare(aValue: number | string, bValue: number | string, isAsc: boolean) {
    return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      switch (sort.active) {
        case 'student':
          return this.sortCompare(
            a.student.studentId || a.student.username,
            b.student.studentId || b.student.username,
            sort.direction === 'asc',
          );
        case 'name':
          return this.sortCompare(a.student?.name, b.student?.name, sort.direction === 'asc');
        case 'tutor': {
          return this.sortCompare(a.tutorNames(), b.tutorNames(), sort.direction === 'asc');
        }
        case 'tutorial':
          return this.sortCompare(
            a.shortTutorialDescription(),
            b.shortTutorialDescription(),
            sort.direction === 'asc',
          );

        case 'target':
          return this.sortCompare(a.targetGrade, b.targetGrade, sort.direction === 'asc');
        case 'submitted-as':
          return this.sortCompare(a.submittedGrade, b.submittedGrade, sort.direction === 'asc');
        case 'grade':
          return this.sortCompare(a.grade, b.grade, sort.direction === 'asc');
        default:
          return 0;
      }
    });
  }
}
