import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from 'app/app.module';
import get from 'lodash/get';
import * as app_config from '../app_config.json';

const appConfig = get(app_config, 'default');
if (!appConfig.inDev) enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
