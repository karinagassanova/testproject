import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// @ts-ignore
import { AppComponent } from './app.component';
// @ts-ignore
import { DataFetchComponent } from './data-fetch/data-fetch.component';
// @ts-ignore
import { MyInterceptor } from './my-interceptor.service';  // Adjust the path as needed

@NgModule({
  declarations: [
    DataFetchComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppComponent
  ],
  providers: [
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MyInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
