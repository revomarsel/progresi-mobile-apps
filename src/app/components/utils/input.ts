interface Validations {
    required?: any;
    min?: any;
    max?: any;
}
export const inputValidator = (data: any, validations: Validations) => {
    let valid = true;
    let err: any = {};
    if (validations) {
        validations.required && validations.required.map(val => {
            if (!data[val]) {
                valid = false;
                err[val] = `${val} tidak boleh kosong`;
            }
        });
        validations.min && validations.min.map(val => {
            const value = val.type ? data[val.key].length : data[val.key];
            if (value < val.value) {
                valid = false;
                err[val.key] = `${val.key} tidak boleh kurang dari ${val.value}`;
            }
        });
        validations.max && validations.max.map(val => {
            const value = val.type ? data[val.key].length : data[val.key];
            if (value > val.value) {
                valid = false;
                err[val.key] = `${val.key} tidak boleh lebih dari ${val.value}`;
            }
        });
        return {
            valid: valid,
            err: err
        }
    } else return {
        valid: valid,
        err: null
    };
}

export const inputBatchValidator = (data: any, validations:any) => {
    let errorMsg:any = [];
    let errIdx = -1;
    let isValid: boolean = true;
    data && data.map((item, idx) => {
        const res = inputValidator(item,
          {
            required: validations && validations.required,
            min: validations && validations.min
          }
        );
        if (!res.valid) {
          isValid = false;
          errorMsg[idx] = res.err;
          if (errIdx < 0) errIdx = idx;
        }
      })
    const result = {
        isValid: isValid,
        errorMsg: errorMsg,
        errIdx: errIdx
    }
    return result;
}

    // const data = {
    //   id: 1,
    //   name: null,
    //   desc: 'bisa'
    // };
    // const validations = {
    //   required: ['name'],
    //   min: [{ key: 'desc', value: 1, type: 'text' }],
    //   max: [{ key: 'desc', value: 3, type: 'text' }]
    // }
    // console.log(inputValidator(data, validations));