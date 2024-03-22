import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import {
  NavController,
  PopoverController,
  ModalController,
} from "@ionic/angular";
import { WebServiceProvider } from "providers/web-service";
import { AppComponent } from "../../app.component";
// import { PopOver, CustomFilterPage } from '../provider';
import { PopOver } from "../popover/popover";
import { CustomFilterPage } from "../custom-filter/custom-filter.page";

@Component({
  selector: "HeaderGlobal",
  templateUrl: "./header-global.html",
  styleUrls: ["./header-global.scss"],
})
export class HeaderGlobal implements OnInit {
  @Input() props: any;
  @Output() event = new EventEmitter<any>();

  headerButtons: any;
  notification_status: number;
  constructor(
    public navCtrl: NavController,
    public app: AppComponent,
    private ws: WebServiceProvider,
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.headerButtons =
      this.props.headerOptions && this.props.headerOptions.buttons;
    if (this.props.notification) this.getNotificationStatus();
    if (this.props.popover) {
      this.props.popover.items.map((val) => {
        if (val.options) {
          if (val.options.type === "custom-filter")
            val.func = () => {
              this.enableCustomFilter();
            };
        }
      });
    }
  }

  async getNotificationStatus() {
    await this.ws.getNotificationStatus().then((res: any) => {
      this.notification_status = res;
    });
  }

  async setNotificationStatus() {
    await this.ws.setNotificationStatus().then((res: any) => {
      this.app.auth.showAlert(res);
    });
    this.getNotificationStatus();
    this.event.emit("notification status changed");
  }

  enableSearch() {
    this.props.search.enable = !this.props.search.enable;
    // this.event.emit({ enable_search:this.props.search.enable });
  }

  enableFilter() {
    this.props.filter.enable = !this.props.filter.enable;
  }

  enableTabs() {
    this.props.tabs.enable = !this.props.tabs.enable;
    // this.event.emit({ enable_tabs:this.props.tabs.enable });
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: PopOver,
      componentProps: {
        title: this.props.popover.title,
        data: this.props.popover.items,
      },
      event: ev,
      translucent: true,
      animated: true,
      mode: "ios",
    });
    return await popover.present();
  }

  async enableCustomFilter() {
    const modal = await this.modalCtrl.create({
      component: CustomFilterPage,
      componentProps: {
        props: this.props.customFilter.filterParam,
        tab: this.props.customFilter.tab,
      },
    });

    modal.onDidDismiss().then((item) => {
      const data = item.data;
      this.event.emit({ cs_data: data });
    });

    return await modal.present();
  }

  navigateBack() {
    this.navCtrl.back();
  }
}
