import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficerDashboardComponent } from './officer-dashboard.component';

describe('OfficerDashboardComponent', () => {
  let component: OfficerDashboardComponent;
  let fixture: ComponentFixture<OfficerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfficerDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
