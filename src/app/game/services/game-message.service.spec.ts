import { TestBed } from '@angular/core/testing';

import { GameMessageService } from './game-message.service';

describe('GameMessageService', () => {
  let service: GameMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
