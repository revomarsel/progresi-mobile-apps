import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeholdersPage } from './stakeholders.page';

describe('StakeholdersPage', () => {
  let component: StakeholdersPage;
  let fixture: ComponentFixture<StakeholdersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StakeholdersPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakeholdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
