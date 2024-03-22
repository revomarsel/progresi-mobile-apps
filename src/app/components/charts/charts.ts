import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { WebServiceProvider } from "providers/web-service";
import { AppComponent } from "../../app.component"
import * as HighCharts from 'highcharts';
import * as HighChartsStock from 'highcharts/highstock';

@Component({
  selector: 'Charts',
  templateUrl: './charts.html',
  styleUrls: ['./charts.scss']
})
export class Charts implements OnInit {
  @Input() chartProps: any;
  @Input() data: any;
  @Input() type: any;
  @Input() role: any;
  @Output() event = new EventEmitter<any>();

  current: string = '';

  constructor(
    public navCtrl: NavController,
    public app: AppComponent,
    private ws: WebServiceProvider
  ) { }

  ngOnInit() { }

  ngOnChanges() {
    this.generateChart(this.chartProps, this.data, this.type);
  }

  ionViewDidEnter() {
    
  }

  async showTab(tab) {
    this.current = tab;
    this.event.emit({ switch_tab: this.current });
  }

  async generateChart(chartProps, data, type) {
    if (type === 'area') this.areaChart(chartProps, data);
    if (type === 'columnCompare') this.columnCompareChart(chartProps, data);
  }

  compareDate(str1) {
    if (str1) {
      var dt1 = parseInt(str1.substring(8, 10));
      var mon1 = parseInt(str1.substring(5, 7));
      var yr1 = parseInt(str1.substring(0, 4));
      var date1 = new Date(yr1, mon1 - 1, dt1 + 1);
      return date1;
    } else {
      return null;
    }

  }

  buildDateFromMonthYear(str) {
    var year = str.substr(str.length - 4);
    var month = str.replace(year, "");
    var res = year + "-" + this.getMonthFromString(month.trim()) + '-01';
    return res;
  }

  getMonthFromString(mon) {
    var months = {
      'January': '01',
      'February': '02',
      'March': '03',
      'April': '04',
      'May': '05',
      'June': '06',
      'July': '07',
      'August': '08',
      'September': '09',
      'October': '10',
      'November': '11',
      'December': '12'
    }
    return months[mon];
  }
  getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() - 6));
    d.setUTCDate(d.getUTCDate() + 1 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo + ' (' + d.getUTCFullYear() + ')';
  }
  areaChart(chartProps, data) {
    if (!chartProps) {
      return;
    }
    if (chartProps.time == 'daily') {
      let pelaksanaan = [];
      let valdaily = [];
      let valcost = [];
      let vallabel = [];
      let plotlines = [];
      for (let i in data) {
        let e = data[i];
        pelaksanaan.push([this.compareDate(e[0]).getTime(), e['pelaksanaan']])
        valdaily.push([this.compareDate(e[0]).getTime(), e['rencana']])
        valcost.push([this.compareDate(e[0]).getTime(), e['percentagecost']])
        vallabel[e[0]] = e['label'];
        if (e.dayoff == 't') {
          plotlines.push(
            {
              color: '#FF0000',
              width: 5,
              value: this.compareDate(e[0]).getTime(),
              label: {
                text: 'Day Off',
              }
            }
          );
        }
      }
      var costSeries
      if(this.role == 4){
        costSeries = {
          name: 'Cost',
          data: [],
          dashStyle: 'longdash',
          connectNulls: true,
          color: '#777',
          showInLegend: false,
          marker: {
            enabled: true,
            radius: 5
          },
        };
      } else {
        costSeries = {
                name: 'Cost',
                data: valcost,
                dashStyle: 'longdash',
                connectNulls: true,
                color: '#777',
                marker: {
                  enabled: true,
                  radius: 5
                },
              };
      }
      // if (!chartProps) {
        //ini handling
        //chartProps di define di progress.ts aja
        chartProps = {
          
          useUTC: false,
          chart: {
            marginBottom: 100,
            height: 500,
          },
          title: {
            text: 'Analisa Pelaksanaan'
          },
          navigator: {
            handles: {
                lineWidth: 1,
                width: 15,
                height: 25
            }
          },
          legend: {
            enabled : true,
            align: 'center',
            layout: 'horizontal',
          },
          xAxis: {            
            gridLineWidth: 1,
            plotLines: plotlines
          },
          yAxis: {
            min: 0,
            labels: {
              formatter: function () {
                return this.value + '%';
              }
            },
            opposite: false,
            crosshair: true,
          },
          rangeSelector: {
            allButtonsEnabled : false,
            buttons: [],
            inputEnabled: true,
            verticalAlign: 'top',
            labelStyle: {
              display: 'none'
            },
            inputBoxWidth: 120,
            inputBoxHeight: 20,
            inputEditDateFormat: '%d-%m-%Y',
            inputDateParser: function (value) {
              var parts = value.split('-');
              return Date.UTC(
                parseInt(parts[2], 10),
                parseInt(parts[1], 10) - 1,
                parseInt(parts[0], 10)
              );
            },
            inputPosition: {
              x: -75,
              y: -10
            },
            inputStyle: {
                fontSize: '17px',
            },     
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true
              }
            }
          },
          credits : {
            enabled : false
          },
          series: [
            {
              name: 'Perencanaan',
              data: valdaily,
              marker: {
                enabled: true,
                radius: 5
              },
              connectNulls: true,
              threshold: 1,
              color: '#25205c',
              tooltip: {
                valueDecimals: 2
              },
            },
            {
              name: 'Pelaksanaan',
              data: pelaksanaan,
              dashStyle: 'longdash',
              marker: {
                enabled: true,
                radius: 5
              },
              connectNulls: true,
              threshold: 1,
              color: '#ef7a2d',
              tooltip: {
                valueDecimals: 2
              },
            },
            costSeries,
          ]
        }
      // }
      HighChartsStock.stockChart('chart', chartProps);
    } else if (chartProps.time == 'weekly') {
      var label = [''];
      var pelaksanaan = [];
      var valweekly = [];
      var valcost = [];
      for (var i in data) {
        var e = data[i];
        var labz = e.label;
        pelaksanaan.push([this.compareDate(labz).getTime(), e['pelaksanaan']]);
        valweekly.push([this.compareDate(labz).getTime(), e['rencana']]);
        valcost.push([this.compareDate(labz).getTime(), e['percentagecost']]);
        label.push(e.label);
      }
      var costSeries;
      if(this.role == 4){
        costSeries = {
          name: 'Cost',
          data: [],
          dashStyle: 'longdash',
          connectNulls: true,
          color: '#777',
          marker: {
            enabled: true,
            radius: 5
          },
          showInLegend: false
        };
      } else {
        costSeries = {
          name: 'Cost',
          data: valcost,
          dashStyle: 'longdash',
          connectNulls: true,
          color: '#777',
          marker: {
            enabled: true,
            radius: 5
          },
        };
      }
      chartProps = {
        useUTC: false,
        chart: {
          marginBottom: 100,
          height: 500,
        },
        title: {
          text: 'Analisa Pelaksanaan'
        },
        navigator: {
          handles: {
              lineWidth: 1,
              width: 15,
              height: 25
          }
        },
        credits : {
          enabled : false
        },        
        legend: {
          enabled : true,
          align: 'center',
          layout: 'horizontal',
        },
        xAxis: {
          gridLineWidth: 1,
          labels: {
            formatter: function () {
              var week = '?';
              // console.log(this.value);
              var d = new Date(this.value);
              d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() - 6));
              d.setUTCDate(d.getUTCDate() + 1 - (d.getUTCDay() || 7));
              var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
              var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
              // week = weekNo +' ('+d.getUTCFullYear()+')';
              week = weekNo + '';
              var dateString = 'Week-' + week;
              return dateString + '<br/>';
            }
          },
        },
        yAxis: {
          min: 0,
          labels: {
            formatter: function () {
              return this.value + '%';
            }
          },
          opposite: false,
          crosshair: true,
        },
        rangeSelector: {
          allButtonsEnabled : false,
          buttons: [],
          inputEnabled: true,
          verticalAlign: 'top',
          labelStyle: {
            display: 'none'
          },
          inputBoxWidth: 120,
          inputBoxHeight: 20,
          inputEditDateFormat: '%d-%m-%Y',
          inputDateParser: function (value) {
            var parts = value.split('-');
            return Date.UTC(
              parseInt(parts[2], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[0], 10)
            );
          },
          inputPosition: {
            x: -75,
            y: -10
          },
          inputStyle: {
              fontSize: '17px',
          },
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true
            }
          }
        },
        series: [
          {
            name: 'Perencanaan',
            data: valweekly,
            marker: {
              enabled: true,
              radius: 5
            },
            connectNulls: true,
            threshold: 1,
            color: '#25205c',
            tooltip: {
              valueDecimals: 2
            },
          },
          {
            name: 'Pelaksanaan',
            data: pelaksanaan,
            dashStyle: 'longdash',
            marker: {
              enabled: true,
              radius: 5
            },
            connectNulls: true,
            threshold: 1,
            color: '#ef7a2d',
            tooltip: {
              valueDecimals: 2
            },
          },
          costSeries,
        ]
      }
      HighChartsStock.stockChart('chart', chartProps);
    } else if (chartProps.time == 'monthly') {
      var label = [''];
      var pelaksanaan = [];
      var valmonthly = [];
      var valcost = [];
      for (var i in data) {
        var e = data[i];
        labz = this.buildDateFromMonthYear(e.label);
        pelaksanaan.push([this.compareDate(labz).getTime(), e['pelaksanaan']]);
        valmonthly.push([this.compareDate(labz).getTime(), e['rencana']]);
        valcost.push([this.compareDate(labz).getTime(), e['percentagecost']]);
        label.push(e.label);
        // if(e.dayoff=='t'){
        // console.log(e);
        // plotlines.push(
        //     {   color: '#FF0000',
        //         width: 5,
        //         value: e[0], 
        //         label: {
        //             text: 'Day Off',
        //         }
        //     }
        // );
        // }
      }
      var costSeries;
      if(this.role == 4){
        costSeries = {
          name: 'Cost',
          data: [],
          dashStyle: 'longdash',
          connectNulls: true,
          color: '#777',
          marker: {
            enabled: true,
            radius: 5
          },
          showInLegend: false
        };
      } else {
        costSeries = {
          name: 'Cost',
          data: valcost,
          dashStyle: 'longdash',
          connectNulls: true,
          color: '#777',
          marker: {
            enabled: true,
            radius: 5
          },
        };
      }
      chartProps = {
        useUTC: false,
        chart: {
          marginBottom: 100,
          height: 500,
        },
        credits : {
          enabled : false
        },
        title: {
          text: 'Analisa Pelaksanaan'
        },
        legend: {
          enabled : true,
          align: 'center',
          layout: 'horizontal',
        },
        navigator: {
          handles: {
              lineWidth: 1,
              width: 15,
              height: 25
          },
          enabled : false
        },
        xAxis: {
          labels: {
            formatter: function () {
              var d = new Date(this.value);
              var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              return monthNames[d.getMonth()] + ' ' + d.getFullYear() + '<br/>';
            },
          },
          gridLineWidth: 1
        },
        yAxis: {
          min: 0,
          labels: {
            formatter: function () {
              return this.value + '%';
            }
          },
          opposite: false,
          crosshair: true,
        },
        rangeSelector: {
          allButtonsEnabled : false,
          buttons: [],
          inputEnabled: false,
          verticalAlign: 'top',
          labelStyle: {
            display: 'none'
          },
          inputBoxWidth: 120,
          inputBoxHeight: 20,
          inputEditDateFormat: '%d-%m-%Y',
          inputDateParser: function (value) {
            var parts = value.split('-');
            return Date.UTC(
              parseInt(parts[2], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[0], 10)
            );
          },
          inputPosition: {
            x: -75,
            y: -10
          },
          inputStyle: {
              fontSize: '17px',
          },
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true
            }
          }
        },
        series: [
          {
            name: 'Perencanaan',
            data: valmonthly,
            marker: {
              enabled: true,
              radius: 5
            },
            connectNulls: true,
            threshold: 1,
            color: '#25205c',
            tooltip: {
              valueDecimals: 2
            },
          },
          {
            name: 'Pelaksanaan',
            data: pelaksanaan,
            dashStyle: 'longdash',
            marker: {
              enabled: true,
              radius: 5
            },
            connectNulls: true,
            threshold: 1,
            color: '#ef7a2d',
            tooltip: {
              valueDecimals: 2
            },
          },
          costSeries,
        ]
      }
      HighChartsStock.stockChart('chart', chartProps);
    }
  }

  columnCompareChart(chartProps, data) {
    this.barChartPopulation(chartProps, data);
  }

  barChartPopulation(chartProps, data) {
    if (!data) return null; //ini handling
    var maxworker = data[0].maxworker;
    var plotlines = [];
    var maxyaxis = 0;
    if (maxworker !== null && maxworker !== 'undefined') {
      plotlines.push(
        {
          color: '#FF0000',
          width: 2,
          value: maxworker,
          label: {
            text: 'Max Worker (' + maxworker + ')<br/>',
            align: 'right',
            x: -10,
            style: {
              fontWeight: 'bold',
              marginBottom: '30px'
            }
          }
        }
      );
      maxyaxis = maxworker;
    }
    if (!chartProps) {
      return;
    }
    if (chartProps.time == 'daily') {
      var label = [];
      var dataactual = [];
      var dataplan = [];
      if (!this.compareDate) return null; //ini handling
      for (var i in data) {
        var e = data[i];
        label.push(e.date);
        if (e.actual < 1) {
          dataactual.push([this.compareDate(e[0]).getTime(), null]);
        } else {
          dataactual.push([this.compareDate(e[0]).getTime(), e.actual]);
        }
        dataplan.push([this.compareDate(e[0]).getTime(), e.plan]);
        maxyaxis = e.actual > maxyaxis ? e.actual : maxyaxis;
        maxyaxis = e.plan > maxyaxis ? e.plan : maxyaxis;
      }      
      chartProps = {
        useUTC: false,
        chart: {
          marginBottom: 100,
          height: 500,
          type: 'column'
        },
        credits : {
          enabled : false
        },
        title: {
          text: 'Jumlah Pekerja'
        },
        navigator: {
          handles: {
              lineWidth: 1,
              width: 15,
              height: 25
          }
        },
        legend: {
          enabled : true,
          align: 'center',
          layout: 'horizontal',
        },
        xAxis: {
          crosshair: true,
          gridLineWidth: 1,
        },
        yAxis: {
          min: 0,
          max: maxyaxis + 5,
          opposite: false,
          crosshair: true,
          title: {
            text: 'Total worker'
          },
          plotLines: plotlines
        },
        rangeSelector: {
          allButtonsEnabled : false,
          buttons: [],
          inputEnabled: true,
          verticalAlign: 'top',
          labelStyle: {
            display: 'none'
          },
          inputBoxWidth: 120,
          inputBoxHeight: 20,
          inputEditDateFormat: '%d-%m-%Y',
          inputDateParser: function (value) {
            var parts = value.split('-');
            return Date.UTC(
              parseInt(parts[2], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[0], 10)
            );
          },
          inputPosition: {
            x: -75,
            y: -10
          },
          inputStyle: {
              fontSize: '17px',
          },
        },
        tooltip: {
          useHTML: true,
          headerFormat: '<table>',
          pointFormat: '<tr><td style="color: black">{series.name}:{point.y} </td>',
          footerFormat: '</table>',
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }
          ],
          shared: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5,
            dataLabels: {
              enabled: true
            }
          },
        },
        series: [
          {
            name: 'Total Planning Worker',
            data: dataplan,
            threshold: 1,
            color: '#25205c',
          },
          {
            name: 'Total Actual Worker',
            data: dataactual,
            threshold: 1,
            color: '#ef7a2d',
          }
        ],
      };
      HighChartsStock.stockChart('chart', chartProps);
    } else if (chartProps.time == 'weekly') {
      var label = [];
      var dataactual = [];
      var dataplan = [];
      for (var i in data) {
        var e = data[i];
        label.push(e.label);
        var labz = e.date;
        if (e.actual < 1) {
          dataactual.push([this.compareDate(labz).getTime(), null]);
        } else {
          dataactual.push([this.compareDate(labz).getTime(), e.actual]);
        }
        dataplan.push([this.compareDate(labz).getTime(), e.plan]);
        maxyaxis = e.actual > maxyaxis ? e.actual : maxyaxis;
        maxyaxis = e.plan > maxyaxis ? e.plan : maxyaxis;
      }

      chartProps = {
        useUTC: false,
        chart: {
          marginBottom: 100,
          height: 500,
          type: 'column'
        },
        navigator: {
          handles: {
              lineWidth: 1,
              width: 15,
              height: 25
          }
        },
        credits : {
          enabled : false
        },
        title: {
          text: 'Jumlah Pekerja'
        },
        legend: {
          enabled : true,
          align: 'center',
          layout: 'horizontal',
        },
        xAxis: {
          crosshair: true,
          gridLineWidth: 1,
          labels: {
            formatter: function () {
              var week = '?';
              // console.log(this.value);
              var d = new Date(this.value);
              d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() - 6));
              d.setUTCDate(d.getUTCDate() + 1 - (d.getUTCDay() || 7));
              var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
              var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
              // week = weekNo +' ('+d.getUTCFullYear()+')';
              week = weekNo + '';
              var dateString = 'Week-' + week;
              return dateString + '<br/>';
            }
          },
        },
        yAxis: {
          min: 0,
          max: maxyaxis + 5,
          opposite: false,
          crosshair: true,
          title: {
            text: 'Total worker'
          },
        },
        rangeSelector: {
          allButtonsEnabled : false,
          buttons: [],
          inputEnabled: true,
          verticalAlign: 'top',
          labelStyle: {
            display: 'none'
          },
          inputBoxWidth: 120,
          inputBoxHeight: 20,
          inputEditDateFormat: '%d-%m-%Y',
          inputDateParser: function (value) {
            var parts = value.split('-');
            return Date.UTC(
              parseInt(parts[2], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[0], 10)
            );
          },
          inputPosition: {
            x: -75,
            y: -10
          },
          inputStyle: {
              fontSize: '17px',
          },
        },
        tooltip: {
          useHTML: true,
          headerFormat: '<table>',
          pointFormat: '<tr><td style="color: black">{series.name}:{point.y}</td>',
          footerFormat: '</table>',
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }
          ],
          shared: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5,
            dataLabels: {
              enabled: true
            }
          },
        },
        series: [
          {
            name: 'Total Planning Worker',
            data: dataplan,
            threshold: 1,
            color: '#25205c',
          },
          {
            name: 'Total Actual Worker',
            data: dataactual,
            threshold: 1,
            color: '#ef7a2d',
          }
        ],
      };
      HighChartsStock.stockChart('chart', chartProps);
    } else if (chartProps.time == 'monthly') {
      var label = [];
      var dataactual = [];
      var dataplan = [];
      for (var i in data) {
        var e = data[i];
        label.push(e.label);
        labz = this.buildDateFromMonthYear(e.date);
        if (e.actual < 1) {
          dataactual.push([this.compareDate(labz).getTime(), null]);
        } else {
          dataactual.push([this.compareDate(labz).getTime(), e.actual]);
        }
        dataplan.push([this.compareDate(labz).getTime(), e.plan]);
        maxyaxis = e.actual > maxyaxis ? e.actual : maxyaxis;
        maxyaxis = e.plan > maxyaxis ? e.plan : maxyaxis;
        chartProps = {
          useUTC: false,
          chart: {
            marginBottom: 100,
            height: 500,
            type: 'column'
          },
          credits : {
            enabled : false
          },
          title: {
            text: 'Jumlah Pekerja'
          },
          navigator: {
            enabled : false
          },
          legend: {
            enabled : true,
            align: 'center',
            layout: 'horizontal',
          },
          xAxis: {
            scrollbar: {
              enabled: false
            },
            crosshair: true,
            gridLineWidth: 1,
            labels: {
              formatter: function () {
                var d = new Date(this.value);
                var monthNames = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                return monthNames[d.getMonth()] + ' ' + d.getFullYear() + '<br/>';
              }
            },
          },
          yAxis: {
            min: 0,
            max: maxyaxis + 5,
            opposite: false,
            crosshair: true,
            title: {
              text: 'Total worker'
            },
          },
          rangeSelector: {
            allButtonsEnabled : false,
            buttons: [],
            inputEnabled: false,
            verticalAlign: 'top',
            labelStyle: {
              display: 'none'
            },
            inputBoxWidth: 120,
            inputBoxHeight: 20,
            inputEditDateFormat: '%d-%m-%Y',
            inputDateParser: function (value) {
              var parts = value.split('-');
              return Date.UTC(
                parseInt(parts[2], 10),
                parseInt(parts[1], 10) - 1,
                parseInt(parts[0], 10)
              );
            },
            inputPosition: {
              x: -75,
              y: -10
            },
            inputStyle: {
                fontSize: '17px',
            },
          },
          tooltip: {
            useHTML: true,
            headerFormat: '<table>',
            pointFormat: '<tr><td style="color: black">{series.name}:{point.y}</td>',
            footerFormat: '</table>',
            crosshairs: [{
              width: 1,
              color: 'Gray'
            }, {
              width: 1,
              color: 'gray'
            }
            ],
            shared: true,
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0.5,
              dataLabels: {
                enabled: true
              }
            },
          },
          series: [
            {
              name: 'Total Planning Worker',
              data: dataplan,
              threshold: 1,
              color: '#25205c',
            },
            {
              name: 'Total Actual Worker',
              data: dataactual,
              threshold: 1,
              color: '#ef7a2d',
            }
          ],
        };
        HighChartsStock.stockChart('chart', chartProps);
      }
    }
  }
}
