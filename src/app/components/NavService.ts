import { Injectable } from '@angular/core';

@Injectable()
export class NavService {

  data: any;
  isDirty: any;

  constructor() { }

  setData(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }

  setDirty(val) {
    this.isDirty = val ? true : false;
  }

  getDirty() {
    return this.isDirty ? true : false;
  }

}
