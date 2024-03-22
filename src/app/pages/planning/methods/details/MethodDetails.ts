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
import get from "lodash/get";
import sumBy from "lodash/sumBy";
import { AlproUtils } from "components/utils/alpro";
import { getImageUrl } from "components/utils";

@Component({
  selector: "MethodDetails",
  templateUrl: "./MethodDetails.html",
})
export class MethodDetails {
  props: IProps = {
    title: "Detail Metode",
    isRoot: false,
    search: {
      enable: false,
      hidden: false,
    },
    tabs: {
      enable: true,
      current: "Tasks",
      items: [
        { name: "Tasks", icon: "list" },
        { name: "Files", icon: "clipboard" },
      ],
    },
    // customFilter: {
    //   enable: false,
    //   inPopover: false,
    //   filterParam: [
    //     {
    //       "name": "Periode",
    //       "type": "text",
    //       "input": "date_range",
    //       "key": "date",
    //       "from": "",
    //       "to": "",
    //     }
    //   ],
    //   hidden: false
    // },
    popover: {
      enable: true,
      title: "Baselines",
      icon: "link-outline",
      items: [],
      hidden: true,
    },
  };
  id: number = Number(this.router.snapshot.paramMap.get("id"));
  auth: any;
  data: any;
  searchKey: string;
  defaultItems: any;
  isDataEmpty: boolean = false;
  tabTime: any = "daily";
  baseline: number;
  cache: ICache = {
    key: this.app.auth.user.username + "-method-details-" + this.id,
    group_key: "api_data",
    ttl: 1000,
  };
  perihal: string;

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
    public router: ActivatedRoute,
    public alpro: AlproUtils
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
    if (ev.enable_tabs !== undefined) this.props.tabs.enable = ev.enable_tabs;
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    this.getData();
  }

  async getData(refresh?) {
    if (refresh) await this.app.cache.removeItems(this.cache.key);
    const res = await this.app.cache.getOrSetItem(
      this.cache.key,
      () =>
        this.ws
          .getAPI("/apiService/GetConstructionMethodDetail", {
            id: this.id,
          })
          .then((res: any) => {
            return res;
          }),
      this.cache.group_key,
      this.cache.ttl
    );
    this.data = get(res, `data.${this.props.tabs.current.toLowerCase()}`);
    this.defaultItems = this.data;
    this.perihal = get(res, "data.perihal");
  }

  async showTab(tab) {
    if (this.data.length < 1) this.isDataEmpty = true;
    this.props.tabs.current = tab;
    await this.getData(true);
    this.searchValue();
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

  searchValue() {
    if (this.searchKey && this.searchKey.trim() !== "") {
      this.data = this.defaultItems.filter((item) => {
        return (
          (item.name &&
            item.name.toLowerCase().indexOf(this.searchKey.toLowerCase()) >
              -1) ||
          (item.file_name &&
            item.file_name.toLowerCase().indexOf(this.searchKey.toLowerCase()) >
              -1) ||
          (item.caption &&
            item.caption.toLowerCase().indexOf(this.searchKey.toLowerCase()) >
              -1)
        );
      });
    } else {
      this.data = this.defaultItems;
    }
  }

  cancelSearch() {
    this.data = this.defaultItems;
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

  downloadFile(link) {
    link = getImageUrl(link);
    const download_window = window.open(link);
    setTimeout(function () {
      download_window.close();
    }, 1000);
    alert("File Downloaded");
  }
}
