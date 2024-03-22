import { Component } from "@angular/core";
import { WebServiceProvider } from "providers/web-service";
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
import { Platform } from "@ionic/angular";
import { IProps } from "components/interfaces";
import get from "lodash/get";
import sumBy from "lodash/sumBy";

@Component({
  selector: "app-projects-reports",
  templateUrl: "./SubconReports.html",
})
export class SubconReports {
  props: IProps = {
    title: "Laporan Harian Subcon",
    isRoot: false,
    tabs: {
      enable: true,
      current: "tasks",
      items: [
        { name: "Task", key: "tasks", icon: "list" },
        { name: "Gambar", key: "pictures", icon: "image" },
      ],
    },
    search: {
      enable: false,
    },
    headerOptions: {
      buttons: this.app.auth.user.UserRoles[0].id === 6 && [
        {
          func: () => {
            switch (this.props.tabs.current) {
              case "tasks":
                this.navCtrl.navigateForward(
                  `subcon-input-task/${this.pid}/${this.date}`
                );
                break;
              case "pictures":
                this.navCtrl.navigateForward(
                  `subcon-input-media/${this.pid}/${this.date}`
                );
                break;
            }
          },
          icon: "create-outline",
        },
      ],
    },
  };
  //navigator
  pid: any;
  rid: any;
  date: any;
  //tabs content
  tasks: any;
  worker: any;
  pictures: any;
  url: string;
  //report navigator
  availableDay: any;
  nextDay: any;
  previousDay: any;
  totalWorkerCost: number;
  totalWorker: number;
  searchKey = "";
  defaultItems;

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
    private platform: Platform
  ) {
    this.availableDay = [];
    this.nextDay = { day: null, rid: null };
    this.previousDay = { day: null, rid: null };
    this.url = this.app.auth.baseURL;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.enable_search !== undefined)
      this.props.search.enable = ev.enable_search;
    if (ev.enable_tabs !== undefined) this.props.tabs.enable = ev.enable_tabs;
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    await this.showReport();
  }

  async showReport(dateNavigated = null) {
    this.pid = await this.router.snapshot.paramMap.get("pid");
    if (!dateNavigated) {
      this.rid = await this.router.snapshot.paramMap.get("rid");
      this.date = this.date
        ? this.date
        : await this.router.snapshot.paramMap.get("date");
    }
    this.getDateNav();
    this.showTab(this.props.tabs.current);
  }

  showTab(tab) {
    this.props.tabs.current = tab;
    this.getData();
  }

  getData() {
    if (this.platform.ready) {
      if (this.props.tabs.current === "tasks") {
        this.getProjectTasks();
      }
      if (this.props.tabs.current == "pictures") {
        this.getProjectPictures();
      }
    }
  }

  async getProjectTasks() {
    const res = await this.ws.getAPI("apiService/GetSubconLaporanHarianInput", {
      id: this.pid,
      date: this.date,
    });
    this.tasks = get(res, "data");
    this.worker = get(res, "worker");
    this.defaultItems = this.tasks;
  }

  async getProjectPictures() {
    const res = await this.ws.getAPI("apiService/GetLaporanHarianSubconFoto", {
      pid: this.pid,
      date: this.date,
    });
    this.pictures = get(res, "data");
    this.defaultItems = this.pictures;
  }

  async getDateNav() {
    this.nextDay = { day: null, rid: null };
    this.previousDay = { day: null, rid: null };
    const res = await this.ws.getAPI("apiService/GetSubconLaporanHarianDate", {
      id: this.pid,
    });
    const data = get(res, "data").reverse();
    this.availableDay = [];
    data &&
      data.forEach((val) => {
        val.id &&
          this.availableDay.push({
            rid: val.id,
            day: val.date,
          });
      });
    const days = this.availableDay.map((item) => {
      return item.day;
    });
    let current_date_index = days.indexOf(this.date);
    if (days.length > 0) {
      if (current_date_index < days.length - 1) {
        this.nextDay.day = this.availableDay[current_date_index + 1]["day"];
        this.nextDay.rid = this.availableDay[current_date_index + 1]["rid"];
      }
      if (current_date_index > 0) {
        this.previousDay.day = this.availableDay[current_date_index - 1]["day"];
        this.previousDay.rid = this.availableDay[current_date_index - 1]["rid"];
      }
    }
  }

  goToReport(val) {
    if (val === "next" && this.nextDay.day != null) {
      this.date = this.nextDay.day;
      this.rid = this.nextDay.rid;
      this.showReport("changed day");
    } else if (val === "previous" && this.previousDay.day != null) {
      this.date = this.previousDay.day;
      this.rid = this.previousDay.rid;
      this.showReport("changed day");
    }
  }

  async ionRefresh(event) {
    console.log("Pull Event Triggered!");
    await this.getData();
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  expandData(data, id, key?) {
    if (!key) key = "id";
    const isElement = (element) => element[key] === id;
    const index = this[data].findIndex(isElement);
    this[data][index].expanded = !this[data][index].expanded;
  }

  searchValue() {
    if (this.searchKey.trim() !== "") {
      this[this.props.tabs.current] = this.defaultItems.filter((item) => {
        return (
          (item.task_name &&
            item.task_name.toLowerCase().indexOf(this.searchKey.toLowerCase()) >
              -1) ||
          (item.info &&
            item.info.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1)
        );
      });
    } else {
      this[this.props.tabs.current] = this.defaultItems;
    }
  }

  cancelSearch() {
    this[this.props.tabs.current] = this.defaultItems;
  }

  async deleteData() {
    if (confirm("Apakah anda yakin ingin menghapus laporan harian?")) {
      const payload = {
        id_project: this.pid,
        id_user: this.app.auth.user.userid,
        date: this.date,
      };
      const res = await this.ws.postAPI(
        "/apiService/resetDailyReport",
        payload
      );
      if (res) {
        if (res.status !== 301) {
          this.navCtrl.pop();
          this.navCtrl.back();
        }
      }
    }
  }

  async changeTaskStatus(ev, status, id) {
    ev.stopPropagation();
    const data = {
      id: id,
      id_user: this.app.auth.user.userid,
      status: status,
    };
    let statusText = "menyetujui";
    if (status === 2) statusText = "menolak";
    if (!confirm(`Apakah anda yakin ingin ${statusText} laporan ini?`)) return;
    const res = await this.ws.postAPI(
      "apiService/PostLaporanHarianSubconApproval",
      data
    );
    if (res) {
      alert("Post Success");
      this.getData(); //refresh data
    } else {
      alert("Post Failed");
    }
  }
}
