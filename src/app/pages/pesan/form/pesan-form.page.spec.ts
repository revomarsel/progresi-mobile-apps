import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PesanFormPage } from './pesan-form.page';

describe('PesanFormPage', () => {
  let component: PesanFormPage;
  let fixture: ComponentFixture<PesanFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PesanFormPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PesanFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
