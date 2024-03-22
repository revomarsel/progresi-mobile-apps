import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { WebServiceProvider } from "providers/web-service";
import { AppComponent } from "../../app.component"

@Component({
  selector: 'Filter',
  templateUrl: './filter.html',
  styleUrls: ['./filter.scss']
})
export class Filter implements OnInit {
  @Input() props: any;
  @Output() event = new EventEmitter<any>();

  current: string = '';

  constructor(
    public navCtrl: NavController,
    public app: AppComponent,
    private ws: WebServiceProvider
  ) { }

  ngOnInit(){ }

  func(ev){
    console.log(ev);
    this.event.emit({ func:ev });
  }

}
