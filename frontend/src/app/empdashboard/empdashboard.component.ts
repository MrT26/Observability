import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empdashboard',
  templateUrl: './empdashboard.component.html',
  styleUrl: './empdashboard.component.css'
})
export class EmpdashboardComponent {
  constructor(private myrouter:Router){}
  @ViewChild('myTag') myTag: any;
  isselected=false;
  user:any;
  username:any;

  ngOnInit(){
    if(localStorage.getItem('loginuser')==null)
    {
      this.myrouter.navigateByUrl('/login');
    }
    else{
      this.user = JSON.parse(localStorage.getItem('loginuser')||'{}');
      this.username = this.user.username;
    }
  }

  togglebar(){
    if (this.myTag.nativeElement.id) {
      this.isselected = !this.isselected;
    }
  }
  logout(){
    localStorage.removeItem("loginuser");
    this.myrouter.navigateByUrl('/login');
  }
}
