import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
  Input,
} from "@angular/core";
import { NavServiceProvider } from "providers/nav-service";
import { NavController } from "@ionic/angular";

@Component({
  selector: "Stepper",
  templateUrl: "./Stepper.html",
  styleUrls: ["./Stepper.scss"],
})
export class Stepper implements AfterViewInit {
  @Input() props: any;
  @ViewChild("expandWrapper", { read: ElementRef }) expandWrapper: ElementRef;
  constructor(public navCtrl: NavController) {}
  ngAfterViewInit() {}

  navigate(url, id) {
    // this.navService.setObject(value);
    // this.navCtrl.navigateForward(url);
    if (id) {
      const stepper = this.props.items;
      this.props.idActive = id;
      for (let index = 0; index < stepper.length; index++) {
        this.props.items[index].isActive = false;
      }
      for (let index = 0; index < stepper.length; index++) {
        if (stepper[index].id <= id) {
          this.props.items[index].isActive = true;
        }
        if (id === stepper[index].id) {
          this.props.titleActive = this.props.items[index].title;
        }
      }
    }
  }
}
