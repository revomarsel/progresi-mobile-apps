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
import moment from "moment";
import { preserveWhitespacesDefault } from "@angular/compiler";

@Component({
  selector: "ProjectCost",
  templateUrl: "./ProjectCost.html",
})
export class ProjectCost {
  props: IProps = {
    title: "Actual Cost",
    isRoot: false,
    search: {
      enable: false,
      hidden: true,
    },
    customFilter: {
      enable: false,
      inPopover: false,
      filterParam: [
        { name: "Deskripsi", type: "text", input: "text", key: "info" },
        {
          name: "No. Bukti/Invoice",
          type: "text",
          input: "text",
          key: "nomor_bukti",
        },
        { name: "Tanggal", type: "date", input: "date_range", key: "date" },
      ],
    },
  };
  id: number = Number(this.router.snapshot.paramMap.get("id"));
  auth: any;
  data: any;
  searchKey: string;
  defaultItems: any;
  isDataEmpty: boolean = false;
  totalCost: number = 0;
  totalWorker: number = 0;
  cache: ICache = {
    key: this.app.auth.user.username + "-costs-" + this.id,
    group_key: "api_data",
    ttl: 500,
  };
  dataByDate: any;
  sumTotal: number = 0;
  sumDebit: number = 0;
  sumKredit: number = 0;
  saldoPrevMonth: number = 0;
  chosenMonth: any;
  maxPeriod: any;

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
    const date = new Date();
    this.maxPeriod = moment(date).format("YYYY-MM");
    this.data = null;
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
    if (ev.cs_data !== undefined) {
      this.data = this.alpro.filterValue(ev.cs_data, this.defaultItems);
      this.dataByDate = this.alpro.groupBy(this.data, "date");
    }
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    this.getData();
  }

  async getData(refresh?) {
    if (refresh) await this.app.cache.removeItems(this.cache.key);
    // const lastPeriod = get(await this.ws.getAPI('/apiService/GetLastActualCost', { pid: this.id }), 'data.date');
    // this.chosenMonth =  this.chosenMonth !== null && moment(lastPeriod).format('YYYY-MM');
    console.log("ddasdasd", {
      pid: this.id,
      month: this.chosenMonth,
    });
    const res = await this.app.cache.getOrSetItem(
      this.cache.key,
      () =>
        this.ws
          .getAPI("/apiService/getActualCostReport", {
            pid: this.id,
            month: this.chosenMonth,
          })
          .then((res: any) => {
            return {
              current_month: get(res, "data.current_month"),
              prev_month: get(res, "data.prev_month"),
            };
          }),
      this.cache.group_key,
      this.cache.ttl
    );
    this.data = get(res, "current_month");
    // this.saldoPrevMonth = get(res, 'prev_month');
    this.defaultItems = this.data;
    this.dataByDate = this.alpro.groupBy(this.data, "date");
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
    this.searchKey = null;
    this.calculateTotals();
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
        this.data = this.defaultItems.filter((item) => {
          return (
            item.subcon.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
          );
        });
      } else {
        this.data = this.defaultItems;
      }
      this.dataByDate = this.alpro.groupBy(this.data, "date");
    }
    this.calculateTotals();
  }

  cancelSearch() {
    this.data = this.defaultItems;
    this.dataByDate = this.alpro.groupBy(this.data, "date");
    this.calculateTotals();
  }

  expandData(id) {
    const isElement = (element) => element.id === id;
    const index = this.data.findIndex(isElement);
    this.data[index].expanded = !this.data[index].expanded;
  }

  getDetails(id, name) {
    this.navCtrl.navigateForward(`subcon-task/${id}/${name}`);
  }

  calculateTotals() {
    this.sumKredit = 0;
    this.sumDebit = 0;
    this.sumTotal = 0;
    this.data &&
      this.data.map((val) => {
        if (Number(val.kredit) > 0) this.sumKredit += Number(val.kredit);
        else this.sumDebit += Number(val.debit);
      });
    this.sumTotal = this.saldoPrevMonth + this.sumKredit - this.sumDebit;
  }

  changePeriod() {
    if (this.chosenMonth !== null)
      this.chosenMonth = moment(this.chosenMonth).format("YYYY-MM");
    this.getData(true);
  }

  deletePeriod() {
    this.chosenMonth = null;
  }
}
