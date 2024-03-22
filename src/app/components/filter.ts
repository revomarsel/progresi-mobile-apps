export const searchItems = (data: any, text: string, arrayOfKeys?: any) => {
    return data.filter(item => {
        let found = false;
        arrayOfKeys.length > 0 && arrayOfKeys.map(val => {
            if(item[val].toLowerCase().indexOf(text) !== -1) found = true;
        });
        return found;
      });
}

export const excludeDuplicate = (data: any, defaultData:any, key:string) => {
    const ids = data && data.map(item => {
        return item[key];
    });
    const itemsList = defaultData && defaultData.filter(item => {
        return !ids.includes(item[key]);
    });
    return itemsList;
}

