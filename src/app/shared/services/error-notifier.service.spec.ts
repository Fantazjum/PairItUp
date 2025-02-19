import { TestBed } from '@angular/core/testing';

import { ErrorNotifierService } from './error-notifier.service';

describe('ErrorNotifierService', () => {
  let service: ErrorNotifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorNotifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
