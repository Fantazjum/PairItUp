import { TestBed } from '@angular/core/testing';

import { WebsocketManagerService } from './websocket-manager.service';

describe('WebsocketManagerService', () => {
  let service: WebsocketManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
