import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:7113/api';

  constructor(private http: HttpClient) {}

  postUser(data: any) {
    return this.http.post(this.baseUrl + '/signup', data);
  }
}
