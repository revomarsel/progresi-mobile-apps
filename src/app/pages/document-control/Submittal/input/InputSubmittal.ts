import { Component, OnInit, ViewChild } from "@angular/core";
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
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "Submittal/",
  templateUrl: "./InputSubmittal.html",
  styleUrls: ["./InputSubmittal.scss", "../../Global.scss"],
})
export class InputSubmittal implements OnInit {
  @ViewChild("scroll") scroller: VirtualScrollerComponent;
  props: IProps = {
    title: "Input Document Submittal",
    isRoot: false,
    stepper: {
      idActive: 1,
      titleActive: "Data Umum",
      items: [
        {
          id: 1,
          title: "Data Umum",
          url: "document-control/Ajukan",
          isActive: true,
        },
        {
          id: 2,
          title: "Data Proyek",
          url: "document-control/Ajukan/2",
          isActive: false,
        },
        {
          id: 3,
          title: "Input Doc",
          url: "document-control/Ajukan/3",
          isActive: false,
        },
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
    key: this.app.auth.user.username + "-document-control-input",
    group_key: "api_data",
    ttl: 100,
  };
  auth: any;
  data: any = {
    created_by: "",
    no: "",
    judul: "",
    due_date: "",
    keterangan: "",
    type_proses: "",
    tasks: [],
    reviewer: [],
    approval: [],
    proyek: [],
    file: null,
    keterangan_file: "",
    type: "",
  };
  searchKey: string;
  defaultItems: any;
  isDataEmpty: boolean = false;
  formId: number;
  projectSearch: string;
  itemsList: any;
  userItemsList: any;
  selectedTask: number = 1;

  projects: any;
  chosenProjectName: string;
  tasks: any;
  chosenTaskName: string;
  fileAsli: string;

  public onSubmittalForm: FormGroup;

  filter: any = {
    enable: true,
    list: null,
    value: "id",
    text: "name",
    canSearch: true,
    onChange: () => {
      this.searchValue(true);
    },
  };

  userApproval: any = {
    enable: true,
    list: null,
    value: "id",
    text: "name",
    canSearch: true,
    onChange: () => {
      this.searchValue(true);
    },
  };

  constructor(
    private ws: WebServiceProvider,
    private formBuilder: FormBuilder,
    public app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public navService: NavServiceProvider,
    public router: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  async selectProyek(ev) {
    console.log(ev.value);
    if (ev.value.id) {
      const items = await this.ws.getAPI("/apiService/getKendalaTaskList", {
        pid: ev.value.id,
      });

      this.itemsList = get(items, "data");

      const userItems = await this.ws.getAPI("/apiService/GetUsersList", {
        pid: ev.value.id,
      });

      const dataUser = get(userItems, "data");
      this.userItemsList = dataUser;
      this.userApproval.list = dataUser;
    }
  }

  async showTab(tab) {
    if (this.data.length < 1) this.isDataEmpty = true;
    this.props.tabs.current = tab;
    await this.getData(true, this.props.tabs.current.toLowerCase());
  }

  async ionViewDidEnter() {
    this.getData();
    await this.getFilter();
  }

  ngOnInit() {
    this.onSubmittalForm = this.formBuilder.group({
      no: [null, Validators.compose([Validators.required])],
    });
  }

  nextStep(id) {
    id += 1;
    const stepper = this.props.stepper.items;
    this.props.stepper.idActive = id;
    for (let index = 0; index < stepper.length; index++) {
      this.props.stepper.items[index].isActive = false;
    }
    for (let index = 0; index < stepper.length; index++) {
      if (stepper[index].id <= id) {
        this.props.stepper.items[index].isActive = true;
      }
      if (id === stepper[index].id) {
        this.props.stepper.titleActive = this.props.stepper.items[index].title;
      }
    }
  }

  async getData(refresh?, choice?) {
    console.log(this.app.auth.user);
    const data = await this.ws.getAPI("/apiService/FormSubmittal", {});
    this.data = get(data, "data");
  }

  searchValue(filter) {
    if (filter && this.filter.data) {
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

  async getFilter() {
    await this.ws.getFilters("Projects").then((res: any) => {
      this.filter.list = res;
    });
  }

  async submit() {
    const file = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.file);
    this.data.file = file["changingThisBreaksApplicationSecurity"];
    await this.postDocumentControl();
    this.data = null;
    this.navCtrl.navigateForward("document-control/submittal");
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
    this.data.file = btoa(binaryString);
  }

  async postDocumentControl() {
    this.app.auth.loadingInit("Posting...");

    await this.ws.postDocumentControl(this.data).then((res: any) => {
      if (res) {
        alert("Post Success");
        this.app.auth.loadingDismiss();
      } else {
        alert("Post Failed");
        this.app.auth.loadingDismiss();
      }
    });
  }
}
