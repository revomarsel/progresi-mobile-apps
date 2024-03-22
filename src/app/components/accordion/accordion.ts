
import { Component, AfterViewInit, Input, ViewChild,  ElementRef, Renderer2 } from "@angular/core";

@Component({
  selector: "Accordion",
  templateUrl: "./accordion.html",
  styleUrls: ["./accordion.scss"]
})
export class Accordion implements AfterViewInit {
  @ViewChild("expandWrapper", { read: ElementRef }) expandWrapper: ElementRef;
  @Input("expanded") expanded: boolean = false;
  @Input("expandHeight") expandHeight: string = "150px";

  constructor(public renderer: Renderer2) {}

  ngAfterViewInit() {
    this.renderer.setStyle(this.expandWrapper.nativeElement, "max-height", this.expandHeight);
  }
}
