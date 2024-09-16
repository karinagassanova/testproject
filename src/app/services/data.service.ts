import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// @ts-ignore
import { AddResponse } from '../models/add-response.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'https://st3nuq5s37.execute-api.us-east-1.amazonaws.com/token/handle';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl+"/hello").pipe(

    );
  }

}
