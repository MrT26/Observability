import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }

  getBranches(){
    return this.http.get(`${this.baseUrl}/branches`,{responseType:'json'});
  }

  sendAmount(user:any){
    return this.http.post(`${this.baseUrl}/users/transaction`,user,({responseType:'json'}));
  }

  getSpendings(userid:any){
    return this.http.get(`${this.baseUrl}/users/spendings/`+userid,{responseType:'json'});
  }
  getEarnings(userid:any){
    return this.http.get(`${this.baseUrl}/users/earnings/`+userid,{responseType:'json'});
  }

  addbranch(branch:any){
    return this.http.post(`${this.baseUrl}/branches`,branch,({responseType:'json'}));
  }

  getCustomers(){
    return this.http.get(`${this.baseUrl}/users/allcustomers`,{responseType:'json'});
  }
  getEmployees(){
    return this.http.get(`${this.baseUrl}/employees`,{responseType:'json'});
  }

  getBranch(id:any){
    return this.http.get(`${this.baseUrl}/branch/`+id,{responseType:'json'});
  }

  getTransactions(){
    return this.http.get(`${this.baseUrl}/users/transactions`,{responseType:'json'});``
  }

  getStats(){
    return this.http.get(`${this.baseUrl}/branches/stats`,{responseType:'json'});
  }

}
