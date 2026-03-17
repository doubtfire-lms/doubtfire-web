import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {GroupSet, Project} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService, ViewType} from '../index/global-state.service';

@Component({
  selector: 'f-project-groups-state',
  templateUrl: './project-groups-state.component.html',
  styleUrls: ['./project-groups-state.component.scss'],
})
export class ProjectGroupsStateComponent implements OnInit, OnDestroy {
  @Input() public project$: Observable<Project>;

  public project: Project;
  public selectedGroupSet: GroupSet;

  private projectSub?: Subscription;

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.projectSub = this.project$?.subscribe((project) => {
      if (!project) {
        return;
      }

      this.project = project;
      this.selectedGroupSet = this.selectedGroupSet ?? project.unit?.groupSets?.[0];
      this.globalStateService.setView(ViewType.PROJECT, project);
    });
  }

  ngOnDestroy(): void {
    this.projectSub?.unsubscribe();
  }
}
