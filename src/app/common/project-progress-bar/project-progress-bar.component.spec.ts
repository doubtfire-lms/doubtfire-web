import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectProgressBarComponent } from './project-progress-bar.component';

describe('ProjectProgressBarComponent', () => {
  let component: ProjectProgressBarComponent;
  let fixture: ComponentFixture<ProjectProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectProgressBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
