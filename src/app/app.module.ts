import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// @ts-ignore
import { AppComponent } from './app.component';
// @ts-ignore
import { MyInterceptor } from './my-interceptor.service';
import {DiagramComponent} from "./components/diagram/diagram.component";
import {FormsModule} from "@angular/forms";

import {CommonModule, JsonPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {ButtonsComponent} from "./components/buttons/buttons.component";
import {SharedService} from "./services/sharedservice";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    DiagramComponent,
    ButtonsComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    JsonPipe,
    NgClass,
    NgForOf,
    NgIf,
    NgbModule,
  ],
  providers: [
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MyInterceptor,
      multi: true
    },
    SharedService
  ],
  exports: [
    DiagramComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
