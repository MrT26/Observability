import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {

  user:any;userid:any;spendings:any;earnings:any;
  constructor(private router:Router, private service:DataService){}
  ngOnInit(){
    if(localStorage.getItem('loginuser')==null)
    {
      this.router.navigateByUrl('/login');
    }
    else{
      this.user = JSON.parse(localStorage.getItem('loginuser')||'{}');
      this.userid = this.user.id;
    }

    this.service.getSpendings(this.userid).subscribe((res:any)=>{
      this.spendings = res;
    })

    this.service.getEarnings(this.userid).subscribe((res:any)=>{
      this.earnings = res;
    })


  }



}
