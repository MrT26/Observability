import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
    private baseUrl = environment.apiUrl;


  constructor(private http:HttpClient) { }
  signup(user:any){
    return this.http.post(`${this.baseUrl}/users/registration`,user,({responseType:'json'}));
  }

  login(user:any){
    return this.http.post(`${this.baseUrl}/users/login`,user,({responseType:'json'}));
  }

  getUsers(userid:any){
    return this.http.get(`${this.baseUrl}/users/customer/`+userid,{responseType:'json'});
  }
  getCustomerbyName(username:any){
    return this.http.get(`${this.baseUrl}/users/customerbyName/`+username,{responseType:'json'});
  }


}
