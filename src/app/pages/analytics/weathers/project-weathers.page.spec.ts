import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectWeathersPage } from './project-weathers.page';

describe('ProjectWeathersPage', () => {
  let component: ProjectWeathersPage;
  let fixture: ComponentFixture<ProjectWeathersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectWeathersPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectWeathersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
