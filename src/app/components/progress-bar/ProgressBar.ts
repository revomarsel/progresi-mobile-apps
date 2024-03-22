import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { WebServiceProvider } from "providers/web-service";
import { AppComponent } from "../../app.component"

@Component({
  selector: 'ProgressBar',
  templateUrl: './ProgressBar.html',
  styleUrls: ['./ProgressBar.scss']
})
export class ProgressBar implements OnInit {
  @Input() value: any;
  @Output() event = new EventEmitter<any>();

  constructor(
    public navCtrl: NavController,
    public app: AppComponent,
    private ws: WebServiceProvider
  ) { }

  ngOnInit() {
    if (!this.value) this.value = 0;
    else if (this.value > 100) this.value = 100; //hardcap
  }

}
