import { Component, ViewChild } from "@angular/core";
import { WebServiceProvider } from "providers/web-service";
import { NavServiceProvider } from "providers/nav-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController,
} from "@ionic/angular";
import { AppComponent } from "app/app.component";
import { ActivatedRoute } from "@angular/router";
import { VirtualScrollerComponent } from "ngx-virtual-scroller";
import { IProps, ICache } from "components/interfaces";
import { getImageUrl } from "components/utils";
import get from "lodash/get";

@Component({
  selector: "DocumentControl",
  templateUrl: "./DocumentControl.html",
  styleUrls: ["./DocumentControl.scss", "./Global.scss"],
})
export class DocumentControl {
  @ViewChild("scroll") scroller: VirtualScrollerComponent;
  props: IProps = {
    title: "Document Control",
    isRoot: false,
  };
  cache: ICache = {
    key: this.app.auth.user.username + "-document-control-list",
    group_key: "api_data",
    ttl: 100,
  };

  auth: any;
  data: any;
  image: string;

  constructor(
    private ws: WebServiceProvider,
    public app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public navService: NavServiceProvider,
    public router: ActivatedRoute
  ) {
    this.auth = this.app.auth;
  }

  async ionViewDidEnter() {
    await this.app.cache
      .getItem(this.cache.key)
      .then(() => {
        if (this.data == null) this.getData();
      })
      .catch(() => {
        this.getData();
      });
    this.app.appPages[2].extraFunc = () => {
      this.scroller.scrollToIndex(0);
    };
  }

  async getData(refresh?) {
    const res = await this.ws.getAPI(
      "/apiService/GetDashboardDocumentControl",
      false
    );
    this.data = get(res, "data");
    console.log(this.data);
    this.image = "assets/img/documents.png";
  }

  async ionRefresh(event) {
    console.log("Pull Event Triggered!");
    await this.getData(true);
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  detailDocumentControl(item) {
    // this.navService.setObject(value);
    this.navCtrl.navigateForward("document-control/" + item);
  }
}
