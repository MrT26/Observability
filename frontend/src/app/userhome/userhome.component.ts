import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-userhome',
  templateUrl: './userhome.component.html',
  styleUrl: './userhome.component.css'
})
export class UserhomeComponent {
  
spendingstotal=0;len=0;
user:any;userid:any;spendings:any;earnings:any;
constructor(private router:Router, private service:DataService,private lservice:LoginService){}
ngOnInit(){
  if(localStorage.getItem('loginuser')==null)
  {
    this.router.navigateByUrl('/login');
  }
  else{
    this.user = JSON.parse(localStorage.getItem('loginuser')||'{}');
    this.userid = this.user.id;
  }
  this.lservice.getUsers(this.userid).subscribe((res:any)=>{ 
    this.user = res;
  })
  this.service.getSpendings(this.userid).subscribe((res:any)=>{
    this.spendings = res;
    this.spendings.forEach((element:any) => {
      this.spendingstotal=this.spendingstotal+element.amount;
    });
    console.log(this.spendingstotal)
    this.len += this.spendings.length;
  })

  this.service.getEarnings(this.userid).subscribe((res:any)=>{
    this.earnings = res;
    this.len += this.earnings.length;
  })

}
finalcalc(){
  console.log("called")
  this.spendingstotal=0;
  console.log(this.spendings)
  
  
}

}
