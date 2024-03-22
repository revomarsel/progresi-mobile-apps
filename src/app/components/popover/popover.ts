import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'PopOver',
  templateUrl: './popover.html',
  styleUrls: ['./popover.scss']
})
export class PopOver implements OnInit {
  title;
  data;
  items;

  constructor(
    public popoverCtrl: PopoverController
  ) { }

  async ngOnInit() {
    if( this.data ) this.items = Object.values(this.data);
  }

  close(){
    this.popoverCtrl.dismiss();
  }

  func(ev){
    ev();
    this.close();
  }

}
