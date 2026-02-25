import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  user:any;userid:any
  constructor(private router:Router,private service:LoginService){}
  ngOnInit(){
    if(localStorage.getItem('loginuser')==null)
    {
      this.router.navigateByUrl('/login');
    }
    else{
      this.user = JSON.parse(localStorage.getItem('loginuser')||'{}');
      this.userid = this.user.id;
    }

    this.service.getUsers(this.userid).subscribe((res:any)=>{ 
      this.user = res;
    })


  }
}
