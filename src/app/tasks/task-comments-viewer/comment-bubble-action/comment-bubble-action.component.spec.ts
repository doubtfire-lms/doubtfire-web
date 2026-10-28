import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {CommentBubbleActionComponent} from './comment-bubble-action.component';

const emptyProvider = {};

describe('CommentBubbleActionComponent', () => {
  let component: CommentBubbleActionComponent;
  let fixture: ComponentFixture<CommentBubbleActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommentBubbleActionComponent],
      providers: [{provide: ConfirmationModalService, useValue: emptyProvider}],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CommentBubbleActionComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentBubbleActionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
