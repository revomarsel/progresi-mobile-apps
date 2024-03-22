import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTroublesPage } from './project-troubles.page';

describe('ProjectTroublesPage', () => {
  let component: ProjectTroublesPage;
  let fixture: ComponentFixture<ProjectTroublesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectTroublesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectTroublesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
