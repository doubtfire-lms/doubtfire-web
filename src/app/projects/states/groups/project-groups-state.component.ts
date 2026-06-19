import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription, of} from 'rxjs';
import {GroupSet, Project} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService} from '../index/global-state.service';

@Component({
  selector: 'f-project-groups-state',
  templateUrl: './project-groups-state.component.html',
  styleUrls: ['./project-groups-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectGroupsStateComponent implements OnInit, OnDestroy {
  @Input() public project$: Observable<Project>;

  public project: Project;
  public selectedGroupSet: GroupSet;

  private projectSub?: Subscription;

  constructor(
    private globalStateService: GlobalStateService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.project$ = this.project$ ?? of(this.route.parent?.snapshot.data.project as Project);

    this.projectSub = this.project$?.subscribe((project) => {
      if (!project) {
        return;
      }

      this.project = project;
      this.selectedGroupSet = this.selectedGroupSet ?? project.unit?.groupSets?.[0];
    });
  }

  ngOnDestroy(): void {
    this.projectSub?.unsubscribe();
  }
}
