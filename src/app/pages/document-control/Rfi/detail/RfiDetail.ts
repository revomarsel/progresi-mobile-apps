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
import get from "lodash/get";
import { DomSanitizer } from "@angular/platform-browser";
import { AlproUtils } from "components/utils/alpro";
import { getImageUrl } from "components/utils";

@Component({
  selector: "RfiDetail",
  templateUrl: "./RfiDetail.html",
  styleUrls: ["./RfiDetail.scss", "../../Global.scss"],
})
export class RfiDetail {
  @ViewChild("scroll") scroller: VirtualScrollerComponent;
  props: IProps = {
    title: "Document Control",
    isRoot: false,
    tabs: {
      enable: true,
      current: "Info Umum",
      items: [
        { name: "Info Umum", icon: "archive-outline" },
        { name: "Akses Dokument", icon: "document-text-outline" },
      ],
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
    key: this.app.auth.user.username + "-document-control-list",
    group_key: "api_data",
    ttl: 100,
  };
  menus = [
    {
      title: "Tertanda Untuk User",
      icon: "people-outline",
      onClick: () => (this.menus[0].expanded = !this.menus[0].expanded),
      expanded: false,
    },
  ];
  menuTask = [
    {
      title: "List Revisi",
      icon: "document-text-outline",
      onClick: () => (this.menuTask[0].expanded = !this.menuTask[0].expanded),
      expanded: true,
    },
  ];
  showForm: boolean = false;
  auth: any;
  data: any;
  searchKey: string;
  tab: string = "Info Umum";
  defaultItems: any;
  isDataEmpty: boolean = false;
  dokumentID: number = Number(this.router.snapshot.paramMap.get("id"));
  projectSearch: string;
  master: any = {
    id: null,
    no: "",
    proyek_name: "",
    created_by: "",
    judul: "",
    due_date: "",
    over_due: "",
    content: "",
    document: "",
  };
  status: any = {
    title: "Status Dokument Open !",
    desc: "Lakukan aksi sebelum lewat Deadline",
    class: "btn-success",
  };
  task: any;
  assigne: any;
  dokument: any;
  fileAsli: string;
  dataRevise: any = {
    action: "reply",
    doc: "",
    keterangan: "",
    id: "",
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
    private sanitizer: DomSanitizer,
    public alpro: AlproUtils
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  async ionViewDidEnter() {
    this.getData();
  }

  // async getFilter() {
  //   await this.ws.getFilters('Projects').then((res: any) => {
  //     this.props.filter.list = res;
  //   });
  // }

  async getData(refresh?, choice?) {
    if (refresh)
      await this.app.cache.removeItems(`${this.cache.key}-${this.dokumentID}`);
    const res = await this.app.cache.getOrSetItem(
      `${this.cache.key}-${this.dokumentID}`,
      () =>
        this.ws
          .getAPI("/apiService/DetilRfi", {
            id: this.dokumentID,
          })
          .then((res: any) => {
            return res;
          }),
      this.cache.group_key,
      this.cache.ttl
    );

    this.master = get(res, "master");
    this.task = get(res, "task");
    this.assigne = get(res, "assigne");
    this.dokument = get(res, "dokument");

    if (!this.master) {
      this.isDataEmpty = true;
    }

    if (this.master.status == "Expired") {
      this.status = {
        title: "Sudah Lewat Tanggal Deadline !",
        desc: "Segera Close dokument ini jika dirasa sudah selesai",
        class: "btn-warning",
      };
    }

    if (this.master.status == "Close") {
      this.status = {
        title: "Status Dokument Close !",
        desc: "Dokument tidak dapat mengirim revisi untuk saat ini",
        class: "btn-danger",
      };
    }
  }

  async ionRefresh(event) {
    await this.getData(true, this.props.tabs.current.toLowerCase());
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  eventHandler(ev) {
    if (ev.switch_tab !== undefined) this.showTab(ev.switch_tab);
    if (ev.func !== undefined) ev.func();
  }

  async showTab(tab) {
    this.tab = tab;
  }

  actionShowHideForm(value) {
    this.showForm = value;
  }

  async submit() {
    this.dataRevise.id = this.master.id;
    await this.postDocumentControl();
    this.dataRevise.keterangan = "";
    this.dataRevise.doc = "";
    this.getData(true);
    // this.navCtrl.navigateForward("document-control/rfi");
  }

  async postDocumentControl() {
    this.app.auth.loadingInit("Posting...");

    await this.ws.postDocumentControl(this.dataRevise).then((res: any) => {
      if (res) {
        alert("Post Success");
        this.app.auth.loadingDismiss();
      } else {
        alert("Post Failed");
        this.app.auth.loadingDismiss();
      }
    });
  }

  async changeStatus() {
    this.app.auth.loadingInit("Posting...");
    const status = {
      action: "Close",
      id: this.master.id,
    };

    await this.ws.poststatusDocumentControl(status).then((res: any) => {
      if (res) {
        alert("Post Success");
        this.app.auth.loadingDismiss();
      } else {
        alert("Post Failed");
        this.app.auth.loadingDismiss();
      }
    });
  }

  handleFileSelect(evt) {
    var files = evt.target.files;
    var file = files[0];
    if (files && file) {
      var reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.dataRevise.doc = btoa(binaryString);
  }

  fileUrl(url) {
    return getImageUrl(url);
  }
}
