import { CurrencyPipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { IonInput } from "@ionic/angular";

@Component({
    selector: 'InputNumber',
    templateUrl: './InputNumber.html',
    // styleUrls: ['./InputNumber.scss'],
    providers: [CurrencyPipe]
  })
  export class InputNumber implements OnInit {
  
    private static BACKSPACE_KEY = 'Backspace';
    private static BACKSPACE_INPUT_TYPE = 'deleteContentBackward';
  
    @ViewChild('numInput', {static: false}) private numInput: IonInput;
  
    @Input() precision: number;
  
    @Input() amount: string;
  
    @Output() amountEntered = new EventEmitter<number>();
  
    constructor(private currencyPipe: CurrencyPipe) { }
  
    ngOnInit() {
      if (this.amount && this.amount.trim() !== '') {
        this.amountEntered.emit(+this.amount);
      }
    }
  
    handleKeyUp(event: KeyboardEvent) {
      // this handles keyboard input for backspace
      if (event.key === InputNumber.BACKSPACE_KEY) {
        this.delDigit();
      }
    }
  
    handleInput(event: CustomEvent) {
      console.log(event.detail.inputType, InputNumber.BACKSPACE_INPUT_TYPE)
      this.clearInput();
      // check if digit
      if (event.detail.data && !isNaN(event.detail.data)) {
        this.addDigit(event.detail.data);
      } else if (event.detail.inputType === InputNumber.BACKSPACE_INPUT_TYPE) {
        // this handles numpad input for delete/backspace
        this.delDigit();
      }
    }
  
    private addDigit(key: string) {
      this.amount = this.amount + key;
      this.amountEntered.emit(Number(this.amount));
    }
  
    private delDigit() {
      this.amount = this.amount && this.amount.substring(0, this.amount.length - 1);
      this.amountEntered.emit(+this.amount);
    }
  
    private clearInput() {
      // this.numInput.value = CONSTANTS.EMPTY; // ensures work for mobile devices
      // // ensures work for browser
      // this.numInput.getInputElement().then((native: HTMLInputElement) => {
      //   native.value = CONSTANTS.EMPTY;
      // });
    }
  
    get formattedAmount(): number {
      // return Number(this.amount) / Math.pow(10, this.precision);
      return Number(this.amount)
      // return this.currencyPipe.transform(+this.amount / Math.pow(10, this.precision));
    }
  
    openInput() {
      // this.numInput.setFocus();
      console.log('asfas')
      this.numInput && this.numInput.setFocus();
    }
  
  }