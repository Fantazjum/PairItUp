import { TestBed } from '@angular/core/testing';

import { MessageManagerService } from './messages-manager.service';

describe('MessagesManagerService', () => {
  let service: MessageManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
