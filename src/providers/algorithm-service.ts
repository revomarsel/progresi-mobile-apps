import {Injectable} from '@angular/core';
import * as moment from 'moment';
import get from 'lodash/get';
import sum from 'lodash/sum';

@Injectable({
  providedIn: 'root'
})
export class AlgorithmServiceProvider {
  
  pageData(data, page) {
    let res = [];
    const qty = page;
    data && data.map((item, idx) => {
      if(idx < qty) res.push(item); 
    })
    return res;
  }

  doMath(){
    console.log('I am doing Math');
  }

  sum(data, key){
    let res = [];
    data && data.map((val)=>{
      res.push(Number(val[key]));
    })
    return sum(res);
  }

  groupBy(data, key){
    let key_map = [];
    data.map((val)=>{
      if(!key_map.includes(val[key]))
        key_map.push(val[key]);
    })
    let results = [];
    let items = [];
    key_map.forEach((val, index)=>{
      results.push({key:val});
      data.forEach((item)=>{
        if(val == item[key]){
          items.push(item);
        }
      })
      results[index]['items'] = items;
      items = [];
    })
    return results;
  }

  getDistinctKeys(data, key){
    let key_map = [];
    data.map((val)=>{
      if(!key_map.includes(val[key]))
        key_map.push(val[key]);
    })
    return key_map;
  }

  getDistinctKeysDesc(data, key, description_items){
    let included_key = [];
    let key_map = [];
    let descriptions = [];
    data.map((val)=>{
      if(!included_key.includes(val[key])){
        included_key.push(val[key]);
        if(description_items.length > 0){
          description_items.forEach((desc)=>{
            descriptions[desc] = val[desc];
          }); 
        }
        key_map.push({key:val[key], desc:descriptions});
        descriptions = [];
      }
    })
    return key_map;
  }

  countItems(data, key, value, count_keys=null){
    let total = [0,0];
    data.forEach((val) => {
      if(val[key]==value){
        count_keys.forEach((count_key,index) =>{
          if(val[count_key])
            total[index] = total[index] + parseFloat(val[count_key]);
        })
      }
    })
    return total;
  }

  countMultipleItems(datas, key, values, count_keys=null){
    let new_data = [];
    let total = [0,0];
    values.forEach((value)=>{
      datas.forEach((data) => {
        if(data[key]==value){
          count_keys.forEach((count_key,index) =>{
            if(data[count_key])
              total[index] = total[index] + parseFloat(data[count_key]);
          })
        }
      })
      new_data.push({key:value, items:total});
      total = [0,0];
    })
    return new_data;
  }

  countMultipleItemsDesc(datas, key, values, count_keys=null){
    let new_data = [];
    let total = [0,0];
    values.forEach((value)=>{
      datas.forEach((data) => {
        if(data[key]==value['key']){
          count_keys.forEach((count_key,index) =>{
            if(data[count_key])
              total[index] = total[index] + parseFloat(data[count_key]);
          })
        }
      })
      new_data.push({key:value['key'], items:total, desc:value['desc']});
      total = [0,0];
    })
    return new_data;
  }

  getDateDifference(x, y = null){
  
    if(!y)
      y = moment()
    else 
      y = moment(y);

    x = moment(x);

    var years = y.diff(x, 'year');
    x.add(years, 'years');

    var months = y.diff(x, 'months');
    x.add(months, 'months');

    var days = y.diff(x, 'days');
    x.add(days, 'days');

    var hours = y.diff(x, 'hours');

    var diff = '';    
    if(years == 1)
      diff += years+' year ';
    if(years > 1)
      diff += years+' years ';
    if(months == 1)
      diff += months+' month ';
    if(months > 1)
      diff += months+' months ';
    if(days == 1)
      diff += days+' day ';
    if(days > 1)
      diff += days+' days ';
    if(hours == 1 && days==0)
      diff += hours+' hour ';
    if(hours > 1 && days==0)
      diff += hours+' hours ';
    if(years > 0 || months>0 || days>0 || hours>0)
      diff += ' ago';

    return diff;
  }

  getDateDifferenceIndonesian(x, y = null){
  
    if(!y)
      y = moment()
    else 
      y = moment(y);

    x = moment(x);

    var years = y.diff(x, 'year');
    x.add(years, 'years');

    var months = y.diff(x, 'months');
    x.add(months, 'months');

    var days = y.diff(x, 'days');
    x.add(days, 'days');

    var hours = y.diff(x, 'hours');

    var diff = '';    
    if(years > 0)
      diff += years+' tahun ';
    if(months > 0)
      diff += months+' bulan ';
    if(days > 0)
      diff += days+' hari ';
    if(hours > 0 && days == 0)
      diff += hours+' jam ';
    if(years > 0 || months>0 || days>0 || hours>0)
      diff += ' lalu';

    return diff;
  }

  dateFormat(value: any, format?: string){
    const inputFormat = format
      ? (format === 'sql' ? 'yyyy-MM-dd HH:mm:ss' : format)
      : "dd MMM yyyy - HH:mm";
      // console.log(value, typeof value, inputFormat, moment(value, inputFormat));
    if (typeof value === "string") {
      return moment(value, inputFormat);
    }
  }

}

// showTotalItemsOverall(data, key, count_keys, template){
//   let total = [];
//   let values = [];
//   if(!data)
//     data = this.defaultItems;
//   const str = this.tab;
//   const desc_items = ['unit'];
//   values = this.alpro.getDistinctKeysDesc(data, str.substring(0, str.length - 1), desc_items);
//   total = this.alpro.countMultipleItemsDesc(data, key, values, count_keys);
//   this.showModalTotalOverall(total, template);
// }

// async showModalTotalOverall(data, template){
//   const modal = await this.modalCtrl.create({
//     component: DetailsPage,
//     componentProps: { title:'ADA', value: data, template: template }
//   });
//   return await modal.present();
// }

// showTotalItems(data, key, value, count_keys){
//   let total = [];
//   if(!data)
//     data = this.defaultItems;
//   total = this.alpro.countItems(data, key, value, count_keys);

//   let header = '';
//   let message = '';

//   if(this.tab=='materials'){
//     if(this.sub_tab_material=='Arrival'){
//       header = 'Total '+value;
//       message = '<div style="text-align:left">Jumlah Material Datang: <b>'+(total[0]).toFixed(2)+'</b></div>'+
//       '<div style="text-align:left">Jumlah Material Direncanakan: <b>'+(total[1]).toFixed(2)+'</b></div>';
//     }else if(this.sub_tab_material=='Consumed'){
//       header = 'Total '+value;
//       message = '<div style="text-align:left">Jumlah Material Digunakan: <b>'+(total[0]).toFixed(2)+'</b></div>'+
//       '<div style="text-align:left">Jumlah Penggunaan Max. Material: <b>'+(total[1]).toFixed(2)+'</b></div>';
//     }
//   }else if(this.tab=='equipments'){
//     if(this.sub_tab_equipment=='in'){
//       header = 'Total '+value;
//       message = '<div style="text-align:left">Jumlah Peralatan Mob: <b>'+(total[0]).toFixed(2)+'</b></div>'+
//       '<div style="text-align:left">Jumlah Mob. Direncanakan: <b>'+(total[1]).toFixed(2)+'</b></div>';
//     }else if(this.sub_tab_equipment=='out'){
//       header = 'Total '+value;
//       message = '<div style="text-align:left">Jumlah Peralatan Demob: <b>'+(total[0]).toFixed(2)+'</b></div>'+
//       '<div style="text-align:left">Jumlah Demob. Direncanakan: <b>'+(total[1]).toFixed(2)+'</b></div>';
//     }
//   }
//   this.showModalTotal(header, message);
// }

// async showModalTotal(header, message){
//   const legends = await this.alertCtrl.create({
//     header: header,
//     message: message,
//     buttons: [
//       {
//         text: 'OK',
//         handler: data => {
//           console.log('OK');
//         }
//       }
//     ]
//   });
//   legends.present();
// }

// (click)="showTotalItems(null, 'material', item.key, ['arrived_qty', 'planned_qty'])" 
// <!-- (tap)="this.showTotalItemsOverall(null, 'material', ['arrived_qty', 'planned_qty'], 'arrival_materials')" -->