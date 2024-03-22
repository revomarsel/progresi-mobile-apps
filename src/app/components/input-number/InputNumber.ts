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
      // if (this.amount && this.amount.trim() !== '') {
      //   this.amountEntered.emit(+this.amount);
      // }
      
    }

    ngOnChanges() {
      this.setHTMLValue();
    }

    setHTMLValue() {
      document.getElementById('numInput').setAttribute('value', moneyFormatter(Number(this.amount)));
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
      this.amountEntered.emit(+this.amount);
    }
  
    private delDigit() {
      this.amount = this.amount && this.amount.substring(0, this.amount.length - 1);
      this.amountEntered.emit(+this.amount);
    }
  
    private clearInput() {
      document.getElementById('numInput').setAttribute('value', '');
    }
  
  }

  const moneyFormatter = (num: number) => {
    return (num).toLocaleString('en-US', {
      style: 'currency',
      currency: 'IDR',
    });
  } 