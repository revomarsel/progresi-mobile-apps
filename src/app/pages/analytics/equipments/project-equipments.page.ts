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
import { ActivatedRoute } from "@angular/router";
import { UIUtils } from "components/utils/ui";
import { AlproUtils } from "components/utils/alpro";
import get from "lodash/get";
import { UploadImageModal } from "modals/upload-image/UploadImageModal";

@Component({
  selector: "app-project-equipments",
  templateUrl: "./project-equipments.page.html",
  styleUrls: ["./project-equipments.page.scss"],
})
export class ProjectEquipmentsPage {
  props: any = {
    title: "PERALATAN",
    isRoot: false,
    tabs: {
      enable: true,
      current: "in",
      items: [
        { name: "Mob.", key: "in", icon: "build" },
        { name: "Demob.", key: "out", icon: "build" },
      ],
    },
    customFilter: {
      enable: false,
      inPopover: false,
      filterParam: [
        {
          name: "Peralatan",
          type: "text",
          input: "dropdown",
          key: "name",
          selectValues: [],
          valueType: "custom",
          value: "",
          searchForInFilter: "equipment",
        },
        {
          name: "Tanggal Perencaan",
          type: "text",
          input: "scroll",
          key: "planned_arrival",
          selectValues: [],
          value: "",
        },
        {
          name: "Tanggal Pelaksanaan",
          type: "text",
          input: "scroll",
          key: "date",
          selectValues: [],
          value: "",
        },
      ],
    },
    headerOptions: {
      buttons: [
        {
          func: () => {},
          icon: "book",
        },
        {
          func: () => {
            this.uploadImage();
          },
          icon: "camera-sharp",
        },
      ],
    },
    popover: {
      enable: true,
      title: "Baselines",
      icon: "link-outline",
      items: [],
    },
  };
  auth: any;
  id: string = this.router.snapshot.paramMap.get("id");
  data: any = { in: null, out: null };
  data_paging: any = { in: null, out: null };
  paging = 10;
  searchKey: string;
  defaultItems: any;
  defaultFilters: any;
  cache = {
    key: this.app.auth.user.username + "-projectEquipments-" + this.id,
    group_key: "api_data",
    ttl: 60 * 60,
  };
  baseline: number;
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
    public alpro: AlproUtils,
    public router: ActivatedRoute,
    public ui: UIUtils
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.enable_tabs !== undefined) this.props.tabs.enable = ev.enable_tabs;
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
    if (ev.func !== undefined) ev.func();
    if (ev.cs_data !== undefined)
      this.filterValue(this.props.tabs.current, ev.cs_data, this.baseline);
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    await this.getFilters();
    this.defaultFilters = this.props.customFilter.filterParam;
    await this.app.cache
      .getItem(`${this.cache.key}-${this.props.tabs.current}`)
      .then(() => {
        if (this.data[this.props.tabs.current] === null)
          this.getData(this.props.tabs.current);
      })
      .catch(() => {
        this.getData(this.props.tabs.current);
      });
  }

  async getData(type, refresh?) {
    const baseline = this.baseline;
    let summary = type === "in" ? "in_equipments" : "out_equipments";
    if (refresh)
      await this.app.cache.removeItems(
        `${this.cache.key}-${this.props.tabs.current}`
      );
    const res = await this.app.cache.getOrSetItem(
      `${this.cache.key}-${this.props.tabs.current}`,
      type === "in"
        ? () =>
            this.ws.getReportInEquipment(baseline).then((res: any) => {
              return res;
            })
        : () =>
            this.ws.getReportOutEquipment(baseline).then((res: any) => {
              return res;
            }),
      this.cache.group_key,
      this.cache.ttl
    );
    this.defaultItems = res;
    this.data[type] = this.alpro.groupBy(res, "equipment");
    this.data_paging[type] = this.alpro.pageData(this.data[type], this.paging);
    this.props.headerOptions.buttons[0].func = () => {
      return this.ui.getFullSummary(
        this.id,
        "Summary Equipment",
        summary,
        baseline
      );
    };
    this.assignFilter(res);
    if (this.data_paging[type] < 1) this.isDataEmpty = true;
  }

  assignFilter(res) {
    if (res.length > 0) {
      this.props.customFilter.filterParam[1].selectValues.push(
        res[0].planned_arrival
      );
      this.props.customFilter.filterParam[1].selectValues.push(
        res[res.length - 1].planned_arrival
      );
      this.props.customFilter.filterParam[2].selectValues.push(res[0].date);
      this.props.customFilter.filterParam[2].selectValues.push(
        res[res.length - 1].date
      );
    }
  }

  filterValue(type, cs_data, baseline?) {
    let summary = type === "in" ? "in_equipments" : "out_equipments";
    const res = this.alpro.filterValue(cs_data, this.defaultItems);
    this.data[type] = this.alpro.groupBy(res, "equipment");
    this.data_paging[type] = this.alpro.pageData(this.data[type], this.paging);
    this.props.headerOptions.buttons[0].func = () => {
      return this.ui.getFullSummary(
        this.id,
        "Summary Equipment",
        summary,
        baseline
      );
    };
  }

  showTab(tab) {
    this.props.tabs.current = tab;
    this.getData(this.props.tabs.current);
  }

  async getFilters() {
    await this.ws.getFilters("equipments", this.id).then((res: any) => {
      this.props.customFilter.filterParam[0].selectValues = res;
    });
    await this.ws.getProjectsDetails(this.id).then((res: any) => {
      const baselines = get(res, "baselines");
      this.baseline = baselines[0].id;
      const baselineList = baselines.map((val) => {
        return {
          func: () => {
            this.baseline = val.id;
            this.getData(this.props.tabs.current, true);
          },
          text: val.name,
          toggle: () => {
            return this.baseline === val.id;
          },
        };
      });
      this.props.popover.items = baselineList;
    });
  }

  expandData(key) {
    const isElement = (element) => element.key === key;
    const index = this.data[this.props.tabs.current].findIndex(isElement);
    this.data[this.props.tabs.current][index].expanded =
      !this.data[this.props.tabs.current][index].expanded;
  }

  async ionRefresh(event) {
    console.log("Pull Event Triggered!");
    await this.getData(this.props.tabs.current, true);
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  loadData(event) {
    setTimeout(() => {
      if (this.data_paging.length < this.data.length)
        this.data_paging = this.alpro.pageData(
          this.data,
          this.data_paging.length + this.paging
        );
      event.target.complete();
      if (this.data_paging.length === this.data.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

  cancelSearch() {
    this.getData(this.props.tabs.current);
  }

  async uploadImage() {
    const data = await this.ws.getAPI("/apiService/GetFotoAnalisa", { pid: this.id, section: '' });
    const modal = await this.modalCtrl.create({
      component: UploadImageModal,
      componentProps: {
        data: data,
        isViewMode: true,
        title: `${this.props.tabs.current === 'in' ? 'Mob.' : 'Demob.'} Peralatan`,
      },
    });
    return await modal.present();
  }
}
