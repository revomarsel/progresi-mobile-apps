import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { ICache, IProps } from 'components/interfaces';
import { AppComponent } from "app/app.component";
import { WebServiceProvider } from "providers/web-service";
import { apiCaller } from 'components/api';
import { getImageUrl } from 'components/utils';
import get from 'lodash/get';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  props: IProps = {
    title: 'EDIT PROFILE',
    isRoot: false
  };
  cache: ICache = {
    key: this.app.auth.user.username + '-editprofile',
    group_key: 'api_data',
    ttl: 1000
  };
  data: any = { id: null, username: '', name: '', email: '', phone: '', position: '', role: null, profile_picture: '', profile_picture_file: null };
  profilePic: any;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public app: AppComponent,
    private ws: WebServiceProvider,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
  }

  async ionViewDidEnter() {
    await this.getData(this.app.auth.user.userid);
  }

  async getData(id) {
    this.data = await this.ws.getProfile(id).then((res: any) => {
      return res;
    });
    this.profilePic = getImageUrl(get(this.data, 'profile_picture'));
  }

  async sendData() {
    const loader = await this.loadingCtrl.create({
      duration: 2000
    });

    loader.present();
    loader.onWillDismiss().then(async l => {
      const toast = await this.toastCtrl.create({
        // showCloseButton: true,
        cssClass: 'bg-profile',
        message: 'Your Data was Edited!',
        duration: 3000,
        position: 'bottom'
      });

      toast.present();
      this.navCtrl.navigateForward('/home-results');
    });
  }

  async postData(msg?:string, val?:string, key?:string) {
    const res = prompt(msg, val);
    if(res){
      this.data[key] = res;
      await this.ws.postProfile(this.data).then(async(res: any) => {
        if(res) this.data = get(res, 'data');
      });
    }
  }

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: true,
      promptLabelHeader: 'Upload Foto',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'Dari Gallery',
      promptLabelPicture: 'Dari Kamera'
    });

    const photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
    const img = photo['changingThisBreaksApplicationSecurity'];

    this.data.profile_picture_file = img;
    await this.ws.postProfile(this.data).then(async(res: any) => {
      if(res) {
        this.data = get(res, 'data');
        this.profilePic = getImageUrl(get(this.data, 'profile_picture'));
      }
    });
  }

}
