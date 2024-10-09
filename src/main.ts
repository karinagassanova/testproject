import { bootstrapApplication } from '@angular/platform-browser';
// @ts-ignore
import { AppComponent } from './app/app.component';


import { provideHttpClient } from '@angular/common/http';
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app/app.module";

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err=>console.log(err))

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideHttpClient()
//   ]
// }).catch(err => console.error(err));
