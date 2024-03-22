import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyReportPage } from './daily-report.page';

describe('DailyReportPage', () => {
  let component: DailyReportPage;
  let fixture: ComponentFixture<DailyReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
