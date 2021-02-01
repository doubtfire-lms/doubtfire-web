import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PortfolioGradeSelectStepComponent } from './portfolio-grade-select-step.component';

describe('PortfolioGradeSelectStepComponent', () => {
    let component: PortfolioGradeSelectStepComponent;
    let fixture: ComponentFixture<PortfolioGradeSelectStepComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [PortfolioGradeSelectStepComponent],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(PortfolioGradeSelectStepComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
}); 