import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Location} from "../models/location.model";


@Injectable({
  providedIn: 'root'
})
export class MapService {
  private baseURL="http://localhost:8080/api/locations";

  constructor(private http: HttpClient) { }

  getLocations(): Observable<any> {
    return this.http.get<any>(this.baseURL);
  }

  deleteLocationById(id: number): Observable<any> {
    return this.http.delete<any>(this.baseURL +'/'+ id);
  }

  saveLocations(location:Location): Observable<Object>{
    return this.http.delete(this.baseURL+'/'+location);
  }

}
