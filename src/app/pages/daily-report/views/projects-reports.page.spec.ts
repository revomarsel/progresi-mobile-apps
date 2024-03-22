import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsReportsPage } from './projects-reports.page';

describe('ProjectsReportsPage', () => {
  let component: ProjectsReportsPage;
  let fixture: ComponentFixture<ProjectsReportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsReportsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
