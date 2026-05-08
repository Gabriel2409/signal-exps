import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideSignalFormsConfig } from '@angular/forms/signals';
// import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // configure signal forms globally
    provideSignalFormsConfig({

      // // NOTE: adding classes, option 1
      // // automatically adds old ng- classes from reactive forms
      // classes: NG_STATUS_CLASSES,

      // NOTE: adding classes, option 2
      // you can also define the behavior of the classes directly
      classes: {
        'ng-touched': ({ state }) => state().touched(),
        'ng-untouched': ({ state }) => !state().touched(),
        'ng-dirty': ({ state }) => state().dirty(),
        'ng-pristine': ({ state }) => !state().dirty(),
        'ng-valid': ({ state }) => state().valid(),
        // Here for ex, we only append the ng-invalid if the field is BOTH invalid and touched
        // which changes a bit from how reactive forms work but works better with our css
        'ng-invalid': ({ state }) => state().invalid() && state().touched(),
        'ng-pending': ({ state }) => state().pending(),
      },
    }),
  ],
};
