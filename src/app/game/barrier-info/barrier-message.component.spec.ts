import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarrierMessageComponent } from './barrier-message.component';

describe('BarrierMessageComponent', () => {
  let component: BarrierMessageComponent;
  let fixture: ComponentFixture<BarrierMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarrierMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarrierMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
