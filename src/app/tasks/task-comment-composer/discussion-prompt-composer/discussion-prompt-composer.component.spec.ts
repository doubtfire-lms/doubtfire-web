import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionPromptComposerComponent } from './discussion-prompt-composer.component';

describe('DiscussionPromptComposerComponent', () => {
  let component: DiscussionPromptComposerComponent;
  let fixture: ComponentFixture<DiscussionPromptComposerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussionPromptComposerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussionPromptComposerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
