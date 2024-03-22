import get from 'lodash/get';
import * as app_config from '../../../app_config.json';

export const getImageUrl = (data) => {
    const url = get(getURL(), 'baseURL');
    const imgUrl = encodeURI(url + data);
    return imgUrl;
}

const getURL = () => {
    const appConfig = get(app_config, 'default');
    let baseURL, URL = '';
    if (appConfig.inDev) {
        baseURL = get(appConfig, 'dev.baseURL');
        URL = get(appConfig, 'dev.URL');
    } else {
        baseURL = get(appConfig, 'prod.baseURL');
        URL = get(appConfig, 'prod.URL');
    }
    return {
        baseURL: baseURL,
        URL: URL
    }
}

