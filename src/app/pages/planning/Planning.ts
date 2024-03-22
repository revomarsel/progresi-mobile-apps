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
import { IProps, ICache } from "components/interfaces";
import { PopOver } from "components/popover/popover";
import get from "lodash/get";
import sumBy from "lodash/sumBy";
import { AlproUtils } from "components/utils/alpro";
import { getImageUrl } from "components/utils";
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import _ from "lodash";
import { DetailsPage } from "modals/details/details.page";

@Component({
  selector: "Planning",
  templateUrl: "./Planning.html",
})
export class Planning {
  props: IProps = {
    title: "Perencanaan",
    isRoot: false,
    search: {
      enable: false,
    },
    // popover: {
    //   enable: false,
    //   items: [
    //     {
    //       func: () => {
    //         this.navigateToMethods();
    //       }, text: 'Metode Konstruksi', icon: 'list-circle-outline', toggle: () => { }
    //     },
    //     {
    //       func: () => {
    //         alert('coming soon')
    //       }, text: 'Safety', icon: 'warning', toggle: () => { }
    //     },
    //     {
    //       func: () => {
    //         alert('coming soon')
    //       }, text: 'Subkontraktor', icon: 'document-sharp', toggle: () => { }
    //     },
    //     {
    //       func: () => {
    //         alert('coming soon')
    //       }, text: 'Hari Libur', icon: 'calendar', toggle: () => { }
    //     },
    //   ]
    // },
    // customFilter: {
    //   enable: false,
    //   inPopover: false,
    //   filterParam: [
    //     { "name": "Task", "type": "text", "input": "dropdown", "key": "status", "selectValues": [], "valueType": "custom", "value": "" },
    //     { "name": "Start Date", "type": "text", "input": "scroll", "key": "start_date", "selectValues": [], "value": "" },
    //     { "name": "End Date", "type": "text", "input": "scroll", "key": "end_date", "selectValues": [], "value": "" }
    //   ]
    // },
  };
  id: number = Number(this.router.snapshot.paramMap.get("id"));
  auth: any;
  data: any;
  dataList: any;
  searchKey: string;
  defaultItems: any;
  isDataEmpty: boolean = false;
  cache: ICache = {
    key: this.app.auth.user.username + "-planning-" + this.id,
    group_key: "api_data",
    ttl: 1000,
  };
  url: SafeResourceUrl;
  baseline: any;
  navs = [
    { name: "Materials Qty \n Control", icon: "cube", url: "" },
    { name: "Equipments \n Schedule", icon: "build", url: "" },
    { name: "Manpower \n Schedule", icon: "people", url: "" },
  ];
  totalValue: number = 0;
  totalDuration: number = 0;
  baselineList: any;
  baselineShow: boolean = false;
  dataView: any;
  dataViewIncrement: number = 10;
  endScrollFunc: any = () => {
    this.dataViewIncrement += 10;
    this.dataView = this.dataList.slice(0, this.dataViewIncrement);
  };

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
    public alpro: AlproUtils,
    public sanitizer: DomSanitizer
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
    if (ev.cs_data !== undefined) {
      this.data = this.alpro.filterValue(ev.cs_data, this.defaultItems);
    }
  }

  async ionViewDidEnter() {
    await this.getFilters();
    await this.getData();
  }

  async getData(refresh?) {
    if (refresh) await this.app.cache.removeItems(this.cache.key);
    this.data = await this.app.cache.getOrSetItem(
      this.cache.key,
      () =>
        this.ws
          .getAPI("/apiService/GetTasksBaseline", {
            bid: this.baseline.id,
          })
          .then((res: any) => {
            return get(res, "data");
          }),
      this.cache.group_key,
      this.cache.ttl
    );
    this.totalDuration = get(this.data, "total_durasi");
    this.dataList = get(this.data, "list");
    this.totalValue = _.sumBy(this.dataList, "sub_total");
    this.defaultItems = this.dataList;
    this.dataView = this.dataList.slice(0, this.dataViewIncrement);
  }

  async getFilters() {
    await this.ws.getProjectsDetails(this.id).then((res: any) => {
      const baselines = get(res, "baselines");
      this.baseline = baselines[0];
      this.baseline && this.setNavBaseline(this.baseline.id);
      const baselineList = baselines.map((val) => {
        return {
          func: () => {
            this.baseline = val;
            this.getData(true);
          },
          id: val.id,
          text: val.name,
          toggle: () => {
            this.setNavBaseline(val.id);
            return this.baseline === val;
          },
        };
      });
      this.baselineList = baselineList;
      // this.props.popover.items = baselineList;
    });
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
    if (filter && this.props.filter.data) {
      this.getData(true);
    } else {
      if (this.searchKey && this.searchKey.trim() !== "") {
        this.dataList = this.defaultItems.filter((item) => {
          return (
            (item.name &&
              item.name.toLowerCase().indexOf(this.searchKey.toLowerCase()) >
                -1) ||
            (item.parent_task &&
              item.parent_task
                .toLowerCase()
                .indexOf(this.searchKey.toLowerCase()) > -1)
          );
        });
      } else {
        this.dataList = this.defaultItems;
      }
    }
  }

  cancelSearch() {
    this.dataList = this.defaultItems;
  }

  showBaseline() {
    this.baselineShow = !this.baselineShow;
  }

  async presentOptions(ev: any, item: any) {
    const items = [
      {
        func: async () => {
          if (!item.has_predecessor) {
            alert("Task tidak mempunyai predecessor");
            return;
          }
          return await this.showTaskDetails(
            "Predecessor",
            item.predecessor_list,
            "predecessor"
          );
        },
        text: "Predecessor",
        icon: "enter-outline",
        toggle: () => item.has_predecessor,
        check: item.has_predecessor,
      },
      {
        func: async () => {
          if (!item.has_material) {
            alert("Task tidak mempunyai material");
            return;
          }
          const data = await this.ws.getAPI("/apiService/GetMaterialSchedule", {
            tc: item.task,
          });
          return await this.showTaskDetails(
            "Perencanaan Material",
            get(data, "data"),
            "material"
          );
        },
        text: "Material",
        icon: "cube",
        toggle: () => item.has_material,
        check: item.has_material,
      },
      {
        func: async () => {
          if (!item.has_peralatan) {
            alert("Task tidak mempunyai peralatan");
            return;
          }
          const data = await this.ws.getAPI(
            "/apiService/GetEquipmentSchedule",
            {
              tc: item.task,
            }
          );
          return await this.showTaskDetails(
            "Perencanaan Peralatan",
            get(data, "data"),
            "equipment"
          );
        },
        text: "Peralatan",
        icon: "build",
        toggle: () => item.has_peralatan,
        check: item.has_peralatan,
      },
      {
        func: async () => {
          if (!item.has_worker) {
            alert("Task tidak mempunyai pekerja");
            return;
          }
          let res = await this.ws.getAPI("/apiService/GetWorkerSchedule", {
            tc: item.task,
          });
          const dataList = get(get(res, "data"), "list");
          if (dataList && res.data)
            res.data.list = this.alpro.groupBy(dataList, "week");
          return await this.showTaskDetails(
            "Perencanaan Pekerja",
            get(res, "data"),
            "worker"
          );
        },
        text: "Pekerja",
        icon: "people",
        toggle: () => item.has_worker,
        check: item.has_worker,
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

  async showTaskDetails(title, data, template) {
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { title: title, value: data, template: template },
    });
    return await modal.present();
  }

  setNavBaseline(id) {
    this.navs[0].url = `materials-planning/${this.id}/${id}`;
    this.navs[1].url = `equipments-planning/${this.id}/${id}`;
    this.navs[2].url = `workers-planning/${this.id}/${id}`;
  }

  navigateToMethods() {
    this.navCtrl.navigateForward(`methods/${this.id}`);
  }
}
