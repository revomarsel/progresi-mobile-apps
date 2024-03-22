import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, LoadingController } from '@ionic/angular';
import { WebServiceProvider } from "providers/web-service";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  public onRegisterForm: FormGroup;
  prodi: any;
  registration = {prodi:null, name:null, nim:null, email:null, phone:null, address:null, sks:null};

  constructor(
    private ws: WebServiceProvider,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder
  ) { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  async ionViewDidEnter(){
    // await this.ws.getAvailableProdi().then((res: any) => {
    //   this.prodi = res;
    //   console.log(this.prodi);
    // });
  }

  ngOnInit() {
    this.onRegisterForm = this.formBuilder.group({
      'prodi': [null, Validators.compose([
        Validators.required
      ])],      
      'name': [null, Validators.compose([
        Validators.required
      ])],
      'nim': [null, Validators.compose([
        Validators.required
      ])],
      'email': [null, Validators.compose([
        Validators.required
      ])],
      'phone': [null, Validators.compose([
        Validators.required
      ])],
      'address': [null, Validators.compose([
        Validators.required
      ])]
    });
  }

  async signUp() {
    console.log(this.registration);
    // const loader = await this.loadingCtrl.create({
    //   duration: 2000
    // });

    // loader.present();
    // loader.onWillDismiss().then(() => {
    //   this.navCtrl.navigateRoot('/home-results');
    // });
  }

  // // //
  goToLogin() {
    this.navCtrl.navigateRoot('/');
  }
}
