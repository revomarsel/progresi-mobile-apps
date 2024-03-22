import { Component, ViewEncapsulation } from "@angular/core";
import {
  WebServiceProvider,
  NavServiceProvider,
} from "../../../../providers/services-provider";
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
import { AlproUtils } from "components/utils/alpro";
import { UIUtils } from "components/utils/ui";
import { renderCalendar } from "components/calendar/calendar";

@Component({
  selector: "app-project-weathers",
  templateUrl: "./project-weathers.page.html",
  styleUrls: [
    "./project-weathers.page.scss",
    "../../../components/calendar/calendar.css",
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectWeathersPage {
  props: any = {
    title: "CUACA",
    isRoot: false,
    tabs: {
      enable: false,
      current: "",
      items: [
        { name: "Lapangan", key: "field", icon: "map" },
        { name: "Safety", key: "safety", icon: "body" },
      ],
    },
  };
  auth: any;
  id: string = this.router.snapshot.paramMap.get("id");
  data: any;
  data_paging: any = { field: null, safety: null };
  weather: any = {};
  weatherDetail: boolean = false;
  weatherDetailData: any = [];
  paging = 10;
  searchKey: string;
  defaultItems: any;
  cache = {
    key: this.app.auth.user.username + "-weathers-" + this.id,
    group_key: "api_data",
    ttl: 10,
  };
  specExpand = [
    {
      jml: 16,
      expanded: false,
    },
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
    public navService: NavServiceProvider,
    public alpro: AlproUtils,
    public router: ActivatedRoute,
    public ui: UIUtils
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    // console.log(renderCalendar());
    // this.id = await this.router.snapshot.paramMap.get('id');
    // this.defaultFilters = this.props.customFilter.filterParam;
    // console.log(this.specExpand)
    let ter = await this.app.cache
      .getItem(`${this.cache.key}-${this.props.tabs.current}`)
      .then(() => {
        if (this.data === null || this.data === undefined) {
          this.getData();
        }
      })
      .catch(() => {
        this.getData();
      });

    // document.querySelectorAll('[data-calendar-status=active]').addEventListener(type, handler);
  }

  async getData(refresh?) {
    if (refresh)
      await this.app.cache.removeItems(
        `${this.cache.key}-${this.props.tabs.current}`
      );
    const res = await this.app.cache.getOrSetItem(
      `${this.cache.key}-${this.props.tabs.current}`,
      () =>
        this.ws.getWeathers(this.id).then((res: any) => {
          return res;
        }),
      this.cache.group_key,
      this.cache.ttl
    );

    let VanillaCalendar = renderCalendar();
    let myCalendar = new VanillaCalendar({
      selector: "#myCalendar",
      weatherDates: res,
      onSelect: async (data) => {
        var dt = new Date(data.date);
        var tgl =
          dt.getFullYear() +
          "-" +
          String(dt.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(dt.getDate()).padStart(2, "0");
        let res = await this.getWeatherDetail(tgl);
        console.log(res[0]);
        if (res[0] !== undefined && res[0] !== "<" && res[0] !== ">") {
          this.weather = res[0];
          this.weatherDetail = true;
        } else {
          this.weather = {};
          this.weatherDetail = false;
        }
        this.weatherDetailData = [];
        for (var i = 0; i < this.weather.weathers.length; i++) {
          this.weatherDetailData.push({
            start_time: this.spJam(this.weather.weathers[i].start_time),
            end_time: this.spJam(this.weather.weathers[i].end_time),
            weather: this.findIcon(this.weather.weathers[i].weather),
          });
        }
      },
    });
    // this.defaultItems = res;
    // this.data = res;
    // this.data_paging = this.alpro.pageData(this.data, this.paging);
    // console.log('asd',this.data);
    // return res;
    // this.assignFilter(type, res);
  }

  async getWeatherDetail(date: any) {
    return await this.ws.getWeatherDetail(this.id, date).then((res) => {
      // console.log('rss', res);
      return res;
    });
  }

  findIcon(c) {
    if (c == "Cerah") {
      return "cloud-outline";
    } else if (c == "libur") {
      return "thunderstorm-outline";
    } else if (c == "Hujan") {
      return "thunderstorm-outline";
    } else if (c == "Gerimis") {
      return "rainy-outline";
    } else if (c == "cerah") {
      return "rainy-outline";
    }
  }

  async ionRefresh(event) {
    await this.getData(true);
    this.weatherDetail = false;
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  async getDatailWeather(id, tgl) {
    var det = await this.ws.getWeatherDetail(id, tgl);
    return det;
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

  searchValue(filter) {
    if (filter && this.props.filter.data) {
      this.getData(this.props.tabs.current);
    }
  }

  cancelSearch() {
    this.getData(this.props.tabs.current);
  }

  expandSpec(key) {
    // const isElement = (element) => element.key === key;
    // const index = this.specExpand.findIndex(isElement);
    this.specExpand[key].expanded = !this.specExpand[key].expanded;
  }

  klik() {
    alert("asd");
  }

  spJam(j) {
    var rt = j.split(":");
    return rt[0] + ":" + rt[1];
  }

  formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  showDetails() {
    let newWeatherDetail = [];
    for (var i = 0; i < this.weather.weathers.length; i++) {
      newWeatherDetail.push({
        start_time: this.spJam(this.weather.weathers[i].start_time),
        end_time: this.spJam(this.weather.weathers[i].end_time),
        weather: this.findIcon(this.weather.weathers[i].weather),
      });
    }

    return this.ui.showWeatherDetails("Detail Cuaca", newWeatherDetail);
  }
}
