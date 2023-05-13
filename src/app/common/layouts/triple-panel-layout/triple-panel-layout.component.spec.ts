import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriplePanelLayoutComponent } from './triple-panel-layout.component';

describe('TriplePanelLayoutComponent', () => {
  let component: TriplePanelLayoutComponent;
  let fixture: ComponentFixture<TriplePanelLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriplePanelLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriplePanelLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
