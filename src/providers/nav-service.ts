import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavServiceProvider {

  objectParam: any;
  projectParam: any;
  weekParam: any;

  constructor() {}

  setObject(val){
    this.objectParam = val; 
  }

  getObject(){
    return this.objectParam;
  }

  setProject(val){
    this.projectParam = val;
  }

  getProject(){
    return this.projectParam;
  }

  setAvailableDailyReportsList(val){
    this.weekParam = val;
  }

  getAvailableDailyReportsList(){
    return this.weekParam;
  }
  
}
