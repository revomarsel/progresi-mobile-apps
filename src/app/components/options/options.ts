import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { WebServiceProvider } from "providers/web-service";
import { AppComponent } from "../../app.component"

@Component({
  selector: 'Options',
  templateUrl: './options.html',
  styleUrls: ['./options.scss']
})
export class Options implements OnInit {
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
    this.event.emit({ func:ev });
  }

}
