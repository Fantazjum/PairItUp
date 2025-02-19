import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioImageComponent } from './radio-image.component';

describe('RadioImageComponent', () => {
  let component: RadioImageComponent;
  let fixture: ComponentFixture<RadioImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadioImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
