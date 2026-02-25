import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private myrouter:Router, private db:LoginService){}
  user : any;
  userinfo : any;
  useremail : any ;
  password : any ;
  welcome:any;
data:any;loginuser:any;
  onLogin(){
    this.user = {
      "email":this.useremail,
      "password":this.password
    }
    console.log(this.user);
    this.db.login(this.user).subscribe((res)=>{
      this.data=res;
      if(this.data.message=="Login successful")
      {
        console.log(this.data)
        if(this.data.role=="customer"){
          this.myrouter.navigateByUrl("/customer/home");
          this.loginuser = {
            "username":this.data.customerName,
            "id":this.data.customerId
          }
          localStorage.setItem("loginuser",JSON.stringify(this.loginuser));
        }
        else if(this.data.role=="employee"){
            this.myrouter.navigateByUrl("/emp/employee");
            this.user = {
              "username":this.data.employeeName,
              "id":this.data.employeeId
            }
            localStorage.setItem("loginuser",JSON.stringify(this.user));
          }
        
       
      }
      else{
        alert("Invalid credentials");      
      }
    }
    )
  }
}

