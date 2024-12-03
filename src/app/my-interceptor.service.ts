import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class MyInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.url.startsWith("https://5h1t6xmh5m")){
      return next.handle(req)
    }

    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer your-token`
      }
    });
    return next.handle(clonedRequest);
  }
}
