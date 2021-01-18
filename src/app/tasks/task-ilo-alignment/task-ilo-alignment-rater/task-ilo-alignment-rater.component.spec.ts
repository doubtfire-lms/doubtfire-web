import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskIloAlignmentRaterComponent } from './task-ilo-alignment-rater.component';

describe('TaskIloAlignmentRaterComponent', () => {
    let component: TaskIloAlignmentRaterComponent;
    let fixture: ComponentFixture<TaskIloAlignmentRaterComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TaskIloAlignmentRaterComponent],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskIloAlignmentRaterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});