import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsightsPage } from './insights.page';

describe('InsightsPage', () => {
  let component: InsightsPage;
  let fixture: ComponentFixture<InsightsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsightsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsightsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
