import { bootstrapApplication } from '@angular/platform-browser';
// @ts-ignore
import { AppComponent } from './app/app.component';


import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient()
  ]
}).catch(err => console.error(err));
