import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {GroupSet} from 'src/app/api/models/doubtfire-model';
import {Group, MemberContribution} from 'src/app/api/models/groups/group';
import {Project} from 'src/app/api/models/project';
import {Task} from 'src/app/api/models/task';

@Component({
  selector: 'f-group-member-contribution-assigner',
  templateUrl: './group-member-contribution-assigner.component.html',
  styleUrls: ['./group-member-contribution-assigner.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GroupMemberContributionAssignerComponent implements OnInit, OnChanges {
  @Input() isTestSubmission: boolean;

  @Input() task: Task;
  @Input() project: Project;
  @Input() team = {memberContributions: [] as MemberContribution[]};
  @Output() teamChange: EventEmitter<{memberContributions: MemberContribution[]}> =
    new EventEmitter();

  selectedGroupSet: GroupSet;
  selectedGroup: Group;

  numStars = 5;
  initialStars = 3;

  percentages = {
    danger: 0,
    warning: 25,
    info: 50,
    success: 100,
  };

  displayedColumns = ['name', 'target-grade', 'contribution'];
  dataSource: MatTableDataSource<MemberContribution> = new MatTableDataSource([]);

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
    // Check if this is an overseer test submission
    if (!this.isTestSubmission) {
      const group = this.project?.getGroupForTask(this.task);
      this.selectedGroup = group;
      if (!this.selectedGroup && this.selectedGroupSet?.groups?.length > 0) {
        this.selectedGroup = this.selectedGroupSet.groups[0];
      }
    }
  }

  private loadMembers(): void {
    if (!this.selectedGroup && this.selectedGroupSet?.groups?.length > 0) {
      console.error(`Could not find project's group`);
      this.team.memberContributions = [];
      return;
    }
    if (this.selectedGroup && this.selectedGroupSet) {
      this.selectedGroup.getMembers().subscribe({
        next: (members) => {
          this.team.memberContributions = members.map((member) => {
            const result: MemberContribution = {
              project: member,
              rating: this.initialStars,
              percent: 0,
              overStar: null,
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

  private memberPercentage(contrib: MemberContribution, rating: number): number {
    return +(
      100 *
      (rating /
        this.selectedGroup.contributionSum(this.team.memberContributions, contrib.project, rating))
    ).toFixed();
  }

  selectRating(contrib: MemberContribution, rating: number) {
    if (contrib.rating !== rating) {
      contrib.rating = rating;
      this.hoveringOver(contrib, rating);
    } else {
      contrib.rating = 0;
      this.hoveringOver(contrib, 0);
    }
  }

  hoveringOver(contrib: MemberContribution, value: number): void {
    contrib.overStar = value;
    contrib.percent = this.memberPercentage(contrib, value);
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
