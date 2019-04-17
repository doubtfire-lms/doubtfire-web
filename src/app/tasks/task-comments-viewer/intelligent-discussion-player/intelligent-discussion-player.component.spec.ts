import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntelligentDiscussionPlayerComponent } from './intelligent-discussion-player.component';

describe('IntelligentDiscussionPlayerComponent', () => {
  let component: IntelligentDiscussionPlayerComponent;
  let fixture: ComponentFixture<IntelligentDiscussionPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntelligentDiscussionPlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntelligentDiscussionPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
