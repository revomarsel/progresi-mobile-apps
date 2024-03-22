import { Component } from '@angular/core';
import { WebServiceProvider } from "providers/web-service";
import { NavServiceProvider } from "providers/nav-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController
} from '@ionic/angular';
import { AppComponent } from "app/app.component";
import { ActivatedRoute } from '@angular/router';
import { DetailsPage } from 'modals/details/details.page';
import { AlproUtils } from "components/utils/alpro";
import { getImageUrl } from 'components/utils';
import get from 'lodash/get';

@Component({
  selector: 'app-pesan-thread',
  templateUrl: './pesan-thread.page.html',
  styleUrls: ['./pesan-thread.page.scss'],
})
export class PesanThreadPage {
  props: any = {
    title: 'DISKUSI TASK',
    isRoot: false,
    options: {
      enable: true,
      items: [
        {
          id: 'analytics',
          func: () => {
            this.goToProject();
          }, icon: 'analytics', color: "-"
        }
      ]
    },
  };
  auth: any;
  pesan: any;
  id_mail: any;
  replies: any;
  searchInput: string;
  defaultOptions: any = [];

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
    public router: ActivatedRoute
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.id_mail = await this.router.snapshot.paramMap.get('id');
    await this.getData();
    this.pesan = await this.navService.getObject();
    const role = this.app.auth.user.UserRoles[0].id;
    this.props.options.items = [
      {
        id: 'analytics',
        func: () => {
          this.goToProject();
        }, icon: 'analytics', color: "-"
      }
    ];
    if (this.pesan && this.pesan.status === 'Open') this.props.options.items.push({
      func: () => {
        this.typeReply();
      }, icon: 'arrow-redo-outline', color: "-"
    });
    if (role === 2) this.props.options.items.push({
      func: async () => {
        await this.changeThreadStatus(this.pesan.status === 'Closed' ? 'Open' : 'Closed');
      }, icon: this.pesan.status === 'Closed' ? 'lock-open-outline' : 'lock-closed-outline', color: "-"
    });
  }

  async getData() {
    await this.ws.getReplies(this.id_mail).then((res: any) => {
      this.replies = res;
    });
    this.replies && this.replies.map(val => {
      if(val.profile_picture) val.profile_picture = getImageUrl(get(val, 'profile_picture'));
    });
  }

  async changeThreadStatus(val: string) {
    await this.ws.postChangeThreadStatus(this.id_mail, val).then(async (res: any) => {
      if (res) {
        await this.app.cache.removeItem(this.app.auth.user.username + '-pesan');
      }
    });
    this.navCtrl.back();
  }

  goToProject() {
    this.navCtrl.navigateForward('project-overview/' + this.pesan.project_id);
  }

  createForm() {
    this.navCtrl.navigateForward('pesan_form/create');
  }

  updateForm(value) {
    this.navService.setObject(value);
    this.navCtrl.navigateForward('pesan_form/update');
  }

  async typeReply() {
    this.navCtrl.navigateForward('pesan_form/' + this.id_mail);
  }

  async postReply(reply) {
    reply['id_mail'] = this.id_mail;
    await this.ws.postReply(reply).then((res: any) => {
      if (res) {
        console.log('post success');
        this.refreshReply();
      } else {
        console.log("post failed");
      }
    });
  }

  async refreshReply() {
    await this.ws.getReplies(this.id_mail).then((res: any) => {
      this.replies = res;
    });
  }

  async presentAttachments(val: any) {
    val['url'] = this.app.auth.baseURL;
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { value: val, template: 'attachments' }
    });
    return await modal.present();
  }

  async onInputSearch() {
    console.log(await this.searchInput);
  }

  async onCancelSearch() {
    this.searchInput = '';
    console.log(this.searchInput);
  }

  async ionRefresh(event) {
    console.log('Pull Event Triggered!');
    await this.getData();
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

}
