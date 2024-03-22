import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlgorithmServiceProvider } from "providers/algorithm-service";

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  @Input() title: String;
  @Input() value: any;
  @Input() template: any;
  public details: any;

  sliderOpts = {
    zoom: {
      maxRatio: 2
    }
  };
  searchKey = '';
  defaultItems: any;

  constructor(
    // private nav: NavController,
    private modalCtrl: ModalController,
    public alpro: AlgorithmServiceProvider
    // private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // this.details = this.sanitizer.bypassSecurityTrustStyle(this.value);
    this.defaultItems = this.value;
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  searchValue(key){
    if (this.searchKey.trim() !== '') {
      this.value = this.defaultItems.filter((item) => {
        return (
          item[key].toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
        );
      });
    }else{
      this.value = this.defaultItems;  
    }
  }

  cancelSearch(){
    this.value = this.defaultItems;
  }

}
