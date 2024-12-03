import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MyInterceptor } from './my-interceptor.service';
import { DiagramComponent } from "./components/diagram/diagram.component";
import { FormsModule } from "@angular/forms";
import { SharedService } from "./services/sharedservice";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ProxyConfigComponent} from "./components/proxy/proxy-config-component";

@NgModule({
  declarations: [
    AppComponent,
    DiagramComponent,
    ProxyConfigComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MyInterceptor,
      multi: true
    },
    SharedService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
