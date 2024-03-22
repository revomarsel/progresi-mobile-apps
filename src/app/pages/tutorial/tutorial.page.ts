import { Component } from '@angular/core';
import { NavController, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage {

  showSkip = true;

  constructor(
    public menuCtrl: MenuController,
    public navCtrl: NavController,
    public storage: Storage
  ) { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  async startApp() {
    await this.storage.set('tutorialComplete', true);
    this.navCtrl.navigateRoot('/login');
  }

}
