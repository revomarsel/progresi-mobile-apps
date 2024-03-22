import { Component } from "@angular/core";
import {
  WebServiceProvider,
  NavServiceProvider,
} from "providers/services-provider";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController,
} from "@ionic/angular";
import { AppComponent } from "app/app.component";
import { DetailsPage } from "modals/details/details.page";
import { ActivatedRoute } from "@angular/router";
import get from "lodash/get";

@Component({
  selector: "app-project-overview",
  templateUrl: "./project-overview.page.html",
  styleUrls: ["./project-overview.page.scss"],
})
export class ProjectOverviewPage {
  props: any = {
    title: "Overview",
    isRoot: false,
  };
  id: string = this.router.snapshot.paramMap.get("id");
  data: any = { details: null, baselines: null };
  searchKey = "";
  cache = {
    key: this.app.auth.user.username + "-project-overview-" + this.id,
    group_key: "api_data",
    ttl: 60 * 60,
  };
  navPlanning: any = "";
  navDailyReport: any = "";
  specExpand: boolean = false;
  analyticsExpand: boolean = false;
  collaborationExpand: boolean = false;
  progress: number = 0;
  menus = [
    {
      title: "Informasi",
      icon: "information",
      onClick: () => (this.menus[0].expanded = !this.menus[0].expanded),
      expanded: false,
    },
    {
      title: "Perencanaan",
      icon: "list-outline",
      onClick: () => (this.menus[1].expanded = !this.menus[1].expanded),
      expanded: false,
      // onClick: () => this.navigatePage(this.navPlanning),
      // isNav: true,
    },
    {
      title: "Laporan Harian",
      icon: "document-text-outline",
      onClick: () => (this.menus[2].expanded = !this.menus[2].expanded),
    },
    {
      title: "Analisa",
      icon: "stats-chart-outline",
      onClick: () => (this.menus[3].expanded = !this.menus[3].expanded),
      expanded: false,
    },
    {
      title: "Kolaborasi",
      icon: "people",
      onClick: () => (this.menus[4].expanded = !this.menus[4].expanded),
      expanded: false,
    },
  ];
  navs = [
    // {'name':'Laporan Harian', icon:'bookmarks', url:''},
    { name: "Progress", icon: "analytics", url: "" },
    { name: "Pekerja", icon: "people", url: "" },
    { name: "Material", icon: "cube", url: "" },
    { name: "Peralatan", icon: "build", url: "" },
    { name: "Actual Cost", icon: "cash-sharp", url: "" },
    { name: "Cuaca", icon: "cloud", url: "" },
    { name: "Kendala", icon: "warning", url: "" },
    { name: "Subkontraktor", icon: "document-sharp", url: "" },
  ];
  navsExtras = [
    { name: "Diskusi", icon: "chatbubbles", url: "" },
    { name: "Users", icon: "people-outline", url: "" },
    { name: "Subkontraktor", icon: "document-sharp", url: "" },
  ];
  navsDailyReport = [
    { name: "Laporan", icon: "document-text", url: "" },
    { name: "Checklist", icon: "checkmark-outline", url: "" },
    { name: "Pengajuan Capaian", icon: "document-sharp", url: "" },
  ];
  navsPlanning = [
    { name: "Task", icon: "document-text", url: "" },
    { name: "Metode Konstruksi", icon: "checkmark-outline", url: "" },
    // { name: "Safety", icon: "checkmark-outline", url: "" },
    // { name: "Subkontraktor", icon: "checkmark-outline", url: "" },
    // { name: "Hari Libur", icon: "checkmark-outline", url: "" },
  ];

  constructor(
    private ws: WebServiceProvider,
    public app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public router: ActivatedRoute,
    public navService: NavServiceProvider
  ) {}

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    await this.app.cache
      .getItem(this.cache.key)
      .then(() => {
        if (!this.data.details || !this.data.baselines) this.getData();
      })
      .catch(() => {
        this.getData();
      });
  }

  async getData(refresh?) {
    if (refresh) await this.app.cache.removeItems(this.cache.key);
    const res = await this.app.cache.getOrSetItem(
      this.cache.key,
      () =>
        this.ws.getProjectsDetails(this.id).then((res: any) => {
          return res;
        }),
      this.cache.group_key,
      this.cache.ttl
    );
    this.data.details = get(res, "details");
    this.data.baselines = get(res, "baselines");
    const nav_data = get(this.data, "details");
    this.navPlanning = `planning/${get(nav_data, "id")}`;
    this.navDailyReport = `daily-report/${get(nav_data, "id")}`;
    this.navs.map((val) => {
      if (val.name === "Progress")
        val.url = `project-progress/${get(nav_data, "id")}`;
      if (val.name === "Pekerja")
        val.url = `project-workers/${get(nav_data, "id")}`;
      if (val.name === "Material")
        val.url = `project-materials/${get(nav_data, "id")}`;
      if (val.name === "Peralatan")
        val.url = `project-equipments/${get(nav_data, "id")}`;
      if (val.name === "Actual Cost")
        val.url = `project-cost/${get(nav_data, "id")}`;
      if (val.name === "Cuaca")
        val.url = `project-weathers/${get(nav_data, "id")}`;
      if (val.name === "Kendala")
        val.url = `project-troubles/${get(nav_data, "id")}`;
      if (
        val.name === "Subkontraktor" &&
        this.app.auth.user.UserRoles[0].id !== 4
      )
        val.url = `project-subcon/${get(nav_data, "id")}`;
    });
    this.navsExtras.map((val) => {
      console.log(`${get(nav_data, "name")}`);
      if (val.name === "Users") val.url = `users/${get(nav_data, "id")}`;
      if (val.name === "Diskusi") val.url = `pesan/${get(nav_data, "name")}`;
      if (
        val.name === "Subkontraktor" &&
        this.app.auth.user.UserRoles[0].id !== 4
      )
        val.url = `subcons/${get(nav_data, "id")}`;
    });
    this.navsDailyReport.map((val) => {
      if (val.name === "Laporan") val.url = `daily-report/${get(nav_data, "id")}`;
      if (val.name === "Checklist") val.url = `checklist/${get(nav_data, "id")}`;
      if (val.name === "Pengajuan Capaian") val.url = `pengajuan-capaian/${get(nav_data, "id")}`;
    });
    this.navsPlanning.map((val) => {
      if (val.name === "Task") val.url = `planning/${get(nav_data, "id")}`;
      if (val.name === "Metode Konstruksi") val.url = `methods/${get(nav_data, "id")}`;
    });
    this.navService.setProject(get(this.data.details, "name"));
    this.progress = get(res, "progress");
  }

  async showDetails(val: any) {
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { value: val, template: "projects" },
    });
    return await modal.present();
  }

  navigatePage(url, ev?) {
    ev && ev.stopPropagation();
    this.navCtrl.navigateForward(url);
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

  getImgUrl(data) {
    const url = encodeURI(this.app.auth.baseURL + data);
    return url;
  }

  expandSpec() {
    this.specExpand = !this.specExpand;
  }

  expandAnalytics() {
    this.analyticsExpand = !this.analyticsExpand;
  }

  expandCollaboration() {
    this.collaborationExpand = !this.collaborationExpand;
  }
}
