import moment from 'moment';

export const dateFormat = (value: any, toFormat?: string, fromFormat?: string) => {
    if (!fromFormat) fromFormat = 'YYYY-MM-DD HH:mm:ss';
    if (!toFormat) toFormat = 'DD MMM YYYY - HH:mm';
    const date = moment(value, fromFormat);
    return date.format(toFormat);
}