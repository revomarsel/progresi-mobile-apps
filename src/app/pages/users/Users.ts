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
  selector: "Users",
  templateUrl: "./Users.html",
})
export class Users {
  @ViewChild("scroll") scroller: VirtualScrollerComponent;
  props: IProps = {
    title: "Users",
    isRoot: false,
    search: {
      enable: false,
    },
    tabs: {
      enable: true,
      current: "All",
      items: [
        { name: "All" },
        { name: "Superadmin" },
        { name: "Project Owner" },
        { name: "Project Manager" },
        { name: "Project Planner" },
        { name: "Project Admin" },
        { name: `Sub-kontraktor` },
        { name: "Guest" },
      ],
    },
    filter: {
      enable: true,
      title: "Filter Proyek",
      data: { id: null, name: null },
      list: null,
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
      disablePullToRefresh: true,
      setState: (ev) => {
        this.scroller.viewPortItems = ev;
        if (this.scroller.viewPortInfo.scrollStartPosition === 0)
          this.props.virtualScrollOptions.disablePullToRefresh = false;
        else this.props.virtualScrollOptions.disablePullToRefresh = true;
      },
    },
  };
  cache: ICache = {
    key: this.app.auth.user.username + "-users-list",
    group_key: "api_data",
    ttl: 100,
  };
  auth: any;
  data: any;
  searchKey: string;
  defaultItems: any;
  isDataEmpty: boolean = false;
  projectId: number;
  projectSearch: string;

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

  eventHandler(ev) {
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
    if (ev.func !== undefined) ev.func();
  }

  async showTab(tab) {
    if (this.data.length < 1) this.isDataEmpty = true;
    this.props.tabs.current = tab;
    await this.getData(true, this.props.tabs.current.toLowerCase());
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    this.projectId = await Number(this.router.snapshot.paramMap.get("pid"));
    await this.getFilter();
    if (this.projectId) {
      this.props.filter.list.map((item, idx) => {
        //find project detail by id
        if (item.id === this.projectId) {
          this.props.filter.data.name = item.name;
          this.props.filter.data.id = item.id;
        }
      });
      this.props.isRoot = false;
    } else {
      this.props.filter.data.name = this.props.filter.list[0].name;
      this.props.filter.data.id = this.props.filter.list[0].id;
    }
    this.getData();
  }

  async getFilter() {
    await this.ws.getFilters("Projects").then((res: any) => {
      this.props.filter.list = res;
    });
  }

  async getData(refresh?, choice?) {
    if (refresh)
      await this.app.cache.removeItems(`${this.cache.key}-${this.projectId}`);
    this.data = await this.app.cache.getOrSetItem(
      `${this.cache.key}-${this.projectId}`,
      () =>
        this.ws
          .getAPI("/apiService/getProjectUsers", {
            id: this.props.filter.data.id,
            role: choice ? choice : "all",
          })
          .then((res: any) => {
            return res;
          }),
      this.cache.group_key,
      this.cache.ttl
    );
    this.data &&
      this.data.map((val) => {
        val.profile_picture =
          val.profile_picture && val.profile_picture !== "null"
            ? getImageUrl(get(val, "profile_picture"))
            : "assets/img/avatar.png";
      });
    this.defaultItems = this.data;
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
    this.searchKey = null;
  }

  async ionRefresh(event) {
    console.log("Pull Event Triggered!");
    await this.getData(true, this.props.tabs.current.toLowerCase());
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  searchValue(filter) {
    if (filter && this.props.filter.data) {
      this.getData(true);
    } else {
      if (this.searchKey && this.searchKey.trim() !== "") {
        this.data = this.defaultItems.filter((item) => {
          return (
            item.name.toLowerCase().indexOf(this.searchKey.toLowerCase()) >
              -1 ||
            item.email.toLowerCase().indexOf(this.searchKey.toLowerCase()) >
              -1 ||
            item.phone.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
          );
        });
      } else {
        this.data = this.defaultItems;
      }
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
}
