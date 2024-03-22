import { Component, OnInit } from "@angular/core";
import {
  NavController,
  LoadingController,
  ToastController,
  AlertController,
} from "@ionic/angular";
import { AppComponent } from "app/app.component";
import { WebServiceProvider } from "providers/web-service";
import { IProps } from "components/interfaces";
import get from "lodash/get";
import { getImageUrl } from "components/utils";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit {
  props: IProps = {
    title: "Profile",
    isRoot: true,
  };
  remSub: any = null;
  urls: any = { support: null };
  profilePic: any = null;
  userData: any = null;
  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public app: AppComponent,
    public alertCtrl: AlertController,
    private ws: WebServiceProvider
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.app.setExitApp();
  }

  ionViewWillLeave() {
    this.app.subBackButton();
  }

  async ionViewDidEnter() {
    console.log("id", this.app.auth.user.userid);
    await this.ws.getProfile(this.app.auth.user.userid).then((res: any) => {
      console.log("res", res);
      if (res) {
        this.profilePic = getImageUrl(get(res, "profile_picture"));
        this.userData = res;
      }
    });
    if (this.app.auth.user.UserRoles[0].id === 2) this.getRemSub();
    console.log(this.userData);
  }

  openURL(url) {
    window.open(url);
  }

  async logout() {
    if (confirm("Apakah anda yakin ingin logout?")) this.app.logout();
  }

  changePass() {
    this.navCtrl.navigateForward("/change_password");
  }

  async getRemSub() {
    this.urls.support = await this.ws.getUniversalUrls("support");
    this.remSub = await this.ws.getRemSub(this.app.auth.user.userid);
  }

  async sendData() {
    const loader = await this.loadingCtrl.create({
      duration: 2000,
    });

    loader.present();
    loader.onWillDismiss().then(async (l) => {
      const toast = await this.toastCtrl.create({
        // showCloseButton: true,
        cssClass: "bg-profile",
        message: "Your Data was Edited!",
        duration: 3000,
        position: "bottom",
      });

      toast.present();
      this.navCtrl.navigateForward("/home-results");
    });
  }

  goToEditProfile = () => {
    this.navCtrl.navigateForward("/edit-profile");
  };
  getRepoImage(img) {
    return getImageUrl(img);
  }
}
