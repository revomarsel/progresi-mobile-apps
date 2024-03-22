import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMaterialsPage } from './project-materials.page';

describe('ProjectMaterialsPage', () => {
  let component: ProjectMaterialsPage;
  let fixture: ComponentFixture<ProjectMaterialsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectMaterialsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMaterialsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
