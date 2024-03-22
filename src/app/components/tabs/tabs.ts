import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { WebServiceProvider } from "providers/web-service";
import { AppComponent } from "../../app.component"

@Component({
  selector: 'Tabs',
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss']
})
export class Tabs implements OnInit {
  @Input() props: any;
  @Output() event = new EventEmitter<any>();

  current: string = '';

  constructor(
    public navCtrl: NavController,
    public app: AppComponent,
    private ws: WebServiceProvider
  ) { }

  ngOnInit(){
    if(this.props.current) this.current = this.props.current;
  }

  async showTab(tab) {
    this.current = tab;
    this.event.emit({ switch_tab:this.current });
  }

}
