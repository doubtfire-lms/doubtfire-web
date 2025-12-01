import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {Group} from 'src/app/api/models/groups/group';
import {GroupSet} from 'src/app/api/models/doubtfire-model';
import {Project} from 'src/app/api/models/project';
import {Task} from 'src/app/api/models/task';
import {GradeService} from 'src/app/common/services/grade.service';
import {MatTableDataSource} from '@angular/material/table';
import {Sort} from '@angular/material/sort';

interface MemberContribution {
  project: Project;
  rating: number;
  confRating: number;
  percent: number;
  overStar: number;
}

@Component({
  selector: 'f-group-member-contribution-assigner',
  templateUrl: './group-member-contribution-assigner.component.html',
  styleUrls: ['./group-member-contribution-assigner.component.scss'],
})
export class GroupMemberContributionAssignerComponent implements OnInit, OnChanges {
  @Input() task: Task;
  @Input() project: Project;
  @Input() team = {memberContributions: [] as MemberContribution[]};
  @Output() teamChange = new EventEmitter<{memberContributions: MemberContribution[]}>();

  selectedGroupSet: GroupSet;
  selectedGroup: Group;
  memberSortOrder = 'project.student.name';
  numStars = 5;
  initialStars = 3;

  percentages = {
    danger: 0,
    warning: 25,
    info: 50,
    success: 100,
  };

  displayedColumns = ['name', 'target-grade', 'contribution'];
  dataSource = new MatTableDataSource<MemberContribution>([]);

  constructor(private gradeService: GradeService) {}

  ngOnInit(): void {
    this.initializeGroupData();
    this.loadMembers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] || changes['project']) {
      this.initializeGroupData();
      this.loadMembers();
    }
  }

  private initializeGroupData(): void {
    this.selectedGroupSet = this.task?.definition?.groupSet;
    if (!this.task?.testSubmissionUrl) {
      const group = this.project?.getGroupForTask(this.task);
      this.selectedGroup = group;
      if (!this.selectedGroup && this.selectedGroupSet?.groups?.length > 0) {
        this.selectedGroup = this.selectedGroupSet.groups[0];
      }
    }
  }

  private loadMembers(): void {
    // Fallback: assign first group in groupSet.groups if selectedGroup is undefined
    if (!this.selectedGroup && this.selectedGroupSet?.groups?.length > 0) {
      this.selectedGroup = this.selectedGroupSet.groups[0];
    }
    if (this.selectedGroup && this.selectedGroupSet) {
      this.selectedGroup.getMembers().subscribe({
        next: (members) => {
          this.team.memberContributions = members.map((member) => {
            const result: MemberContribution = {
              project: member,
              rating: this.initialStars,
              confRating: this.initialStars,
              percent: 0,
              overStar: 0,
            };
            result.percent = this.memberPercentage(result, this.initialStars);
            return result;
          });

          // Update percentages based on member count
          this.percentages.warning = +(25 / members.length).toFixed();
          this.percentages.info = +(50 / members.length).toFixed();
          this.percentages.success = +(95 / members.length).toFixed();

          this.teamChange.emit(this.team);
          this.dataSource.data = [...this.team.memberContributions];
        },
      });
    } else {
      this.team.memberContributions = [];
      this.teamChange.emit(this.team);
    }
  }

  checkClearRating(contrib: MemberContribution): void {
    if (contrib.confRating === 1 && contrib.overStar === 1 && contrib.rating === 0) {
      contrib.rating = contrib.percent = 0;
    } else if (contrib.confRating === 1 && contrib.overStar === 1) {
      contrib.rating = 1;
    }
    contrib.confRating = contrib.rating;
  }

  private memberPercentage(contrib: MemberContribution, rating: number): number {
    return +(
      100 *
      (rating /
        this.selectedGroup.contributionSum(this.team.memberContributions, contrib.project, rating))
    ).toFixed();
  }

  hoveringOver(contrib: MemberContribution, value: number): void {
    contrib.overStar = value;
    contrib.percent = this.memberPercentage(contrib, value);
  }

  percentClass(percent: number): string {
    if (percent >= this.percentages.success) return 'label-success';
    if (this.percentages.info <= percent && percent < this.percentages.success) return 'label-info';
    if (this.percentages.warning <= percent && percent < this.percentages.info)
      return 'label-warning';
    if (this.percentages.danger <= percent && percent < this.percentages.warning)
      return 'label-danger';
    return 'label-danger';
  }

  // Grade-related methods
  gradeFor(value: number | string): string {
    if (typeof value === 'string') {
      return this.gradeService.grades[value] || value;
    }
    return this.gradeService.grades[value] || 'Unknown';
  }

  gradeColor(value: number | string): string {
    if (typeof value === 'string') {
      return this.gradeService.gradeColors[value] || '#000000';
    }
    return this.gradeService.gradeColors[value] || '#000000';
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
        case 'name':
          return this.sortCompare(
            a.project.student.name,
            b.project.student.name,
            sort.direction === 'asc',
          );
        case 'target-grade':
          return this.sortCompare(
            a.project.targetGrade,
            b.project.targetGrade,
            sort.direction === 'asc',
          );
        case 'contribution':
          return this.sortCompare(a.rating, b.rating, sort.direction === 'asc');
        default:
          return 0;
      }
    });
  }
}
