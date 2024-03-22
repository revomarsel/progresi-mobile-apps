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
import { PopOver } from "components/popover/popover";
import { getImageUrl } from "components/utils";
import get from "lodash/get";

@Component({
  selector: "SubmittalHome",
  templateUrl: "./SubmittalHome.html",
  styleUrls: ["./SubmittalHome.scss", "../../Global.scss"],
})
export class SubmittalHome {
  @ViewChild("scroll") scroller: VirtualScrollerComponent;
  props: IProps = {
    title: "Document Control Submittal",
    isRoot: false,
    search: {
      enable: false,
    },
    tabs: {
      enable: true,
      current: "Persetujuan",
      items: [
        { name: "Persetujuan", icon: "archive-outline" },
        { name: "Pengajuan", icon: "send-outline" },
        { name: "Draft", icon: "document-outline" },
        { name: "Ajukan", icon: "add-circle-outline" },
      ],
    },
    filter: {
      enable: true,
      title: "Access",
      data: { id: 0, name: "Tampilkan Semua" },
      list: [
        { id: 0, name: "Tampilkan Semua" },
        { id: 1, name: "Submitted" },
        { id: 2, name: "Approved" },
        { id: 3, name: "Reject" },
        { id: 4, name: "Revise" },
        { id: 5, name: "Overdue" },
      ],
      value: "id",
      text: "name",
      canSearch: true,
      onChange: () => {
        this.searchValue(true);
      },
      onCancel: () => {
        this.cancelSearch();
      },
      hideClear: true,
    },
    virtualScrollOptions: {
      disablePullToRefresh: false,
      setState: (ev) => {
        this.scroller.viewPortItems = ev;
        if (this.scroller.viewPortInfo.scrollStartPosition === 0)
          this.props.virtualScrollOptions.disablePullToRefresh = false;
        else this.props.virtualScrollOptions.disablePullToRefresh = true;
      },
    },
  };
  cache: ICache = {
    key: this.app.auth.user.username + "-Submittal-list",
    group_key: "api_data",
    ttl: 100,
  };
  auth: any;
  data: any;
  searchKey: string;
  fitur: string;
  filter: string;
  dataSearch: string;
  isDataEmpty: boolean = false;

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

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev, type) {
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
    if (ev.func !== undefined) ev.func();
  }

  async showTab(tab) {
    // if (this.data.length < 1) this.isDataEmpty = true;
    this.props.tabs.current = tab;
    tab = tab.replace(/\s/g, "");
    // await this.getData(true, this.props.tabs.current.toLowerCase());
    if (tab == "Ajukan") {
      this.navCtrl.navigateForward("document-control/submittal/" + tab);
    } else {
      tab = tab.toLowerCase();
      this.fitur = tab;
      await this.getData(true);
    }
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    this.getData();
  }

  async getData(refresh?) {
    if (refresh) await this.app.cache.removeItems(`${this.cache.key}`);
    await this.app.cache.removeItems(`${this.cache.key}`);
    const res = await this.app.cache.getOrSetItem(
      `${this.cache.key}`,
      () =>
        this.ws
          .getAPI("/apiService/ListSubmittal", {
            fitur: this.fitur ? this.fitur : "inbox",
            filter: this.filter ? this.filter : "all",
            search: this.searchKey ? this.searchKey : null,
          })
          .then((res: any) => {
            return res;
          }),
      this.cache.group_key,
      this.cache.ttl
    );
    this.data = get(res, "data");
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
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

  searchValue(filter) {
    if (filter && this.props.filter.data.name) {
      this.filter = this.props.filter.data.name;
      this.filter = this.filter.toLowerCase();
      this.getData(true);
    } else {
      if (this.searchKey.length > 5) {
        this.getData(true);
      }
    }
  }

  cancelSearch() {
    this.searchKey = "";
    this.getData(true);
  }

  detailDocumentControl(item) {
    this.navCtrl.navigateForward("document-control/submittal/" + item);
  }

  fileUrl(url) {
    return getImageUrl(url);
  }

  async presentOptions(ev: any, item: any) {
    const items = [
      {
        func: () => {
          this.app.shareWhatsApp(item.phone);
        },
        text: "WhatsApp",
        icon: "logo-whatsapp",
        iconColor: "#25d366",
      },
      {
        func: () => {
          this.app.shareEmail(item.email);
        },
        text: "E-mail",
        icon: "mail",
        iconColor: "var(--ion-color-secondary)",
      },
    ];
    const popover = await this.popoverCtrl.create({
      component: PopOver,
      componentProps: { data: items },
      event: ev,
      translucent: true,
      animated: true,
      mode: "ios",
    });
    return await popover.present();
  }
}
