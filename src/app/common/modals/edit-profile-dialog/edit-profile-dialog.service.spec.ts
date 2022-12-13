import { TestBed } from '@angular/core/testing';

import { EditProfileDialogService } from './edit-profile-dialog.service';

describe('EditProfileDialogService', () => {
  let service: EditProfileDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditProfileDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
