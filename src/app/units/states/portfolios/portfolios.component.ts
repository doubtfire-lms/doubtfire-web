import {Observable, first, of} from 'rxjs';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'f-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrl: './portfolios.component.scss',
  standalone: false,
})
export class PortfoliosComponent implements OnInit {
  @Input() unit$: Observable<Unit>;

  // Exposed to child components
  public unit: Unit = null;
  public selectedProject: Project;

  @ViewChild('tabs') tabs!: MatTabGroup;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
  ) {}

  studentSelected(project: Project) {
    this.selectedProject = null;

    this.projectService.loadProject(project, this.unit).subscribe({
      next: (project) => {
        this.selectedProject = project;
        this.tabs.selectedIndex = 1;
      },
      error: (error) => {
        this.alertService.error(`Failed to load project: ${error}`, 6000);
        console.error(error);
      },
    });
  }

  ngOnInit(): void {
    this.unit$ = this.unit$ ?? of(this.route.parent.snapshot.data.unit);
    this.unit$?.pipe(first()).subscribe({
      next: (unit) => {
        this.projectService.loadStudents(unit, false).subscribe({
          next: () => {
            this.unit = unit;
            this.unit.loadD2lMapping().subscribe();
          },
          error: (error) => {
            this.alertService.error(`Failed to load unit: ${error}`, 6000);
            this.router.navigateByUrl('/home');
          },
        });
      },
      error: (error) => {
        this.alertService.error(`Failed to load unit: ${error}`, 6000);
        this.router.navigateByUrl('/home');
      },
    });
  }
}
