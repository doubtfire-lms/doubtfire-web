import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitGroupSetEditorComponent } from './unit-group-set-editor.component';

describe('UnitGroupSetEditorComponent', () => {
  let component: UnitGroupSetEditorComponent;
  let fixture: ComponentFixture<UnitGroupSetEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitGroupSetEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitGroupSetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
