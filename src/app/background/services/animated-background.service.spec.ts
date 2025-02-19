import { TestBed } from '@angular/core/testing';

import { AnimatedBackgroundService } from './animated-background.service';

describe('AnimatedBackgroundService', () => {
  let service: AnimatedBackgroundService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimatedBackgroundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
