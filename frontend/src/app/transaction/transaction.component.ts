import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent {

  recieverId:any;
  amount:any;
  password:any;
  senderId:any;
user:any;selectedImg:any;selectedmsg:any;
constructor(private router:Router,private service:DataService){}

  rewardsimgs=[
    "assets/images/rewards/1.png",
    "assets/images/rewards/2.png",
    "assets/images/rewards/3.png",
    "assets/images/rewards/4.jpeg",
  ]

  rewardmsg=["Congratulations! You have won a cashback of 10% on your transaction",
    "Congratulations! You have won a cashback of 20% on your transaction",
    "Congratulations! You have won a cashback of 30% on your transaction",
    "Congratulations! You have won a cashback of 40% on your transaction",
  ]


  ngOnInit(){
    if(localStorage.getItem('loginuser')==null)
    {
      this.router.navigateByUrl('/login');
    }
    else{
      this.user = JSON.parse(localStorage.getItem('loginuser')||'{}');
      this.senderId = this.user.id;
    }
  }

  sendAmount(){
    this.user = {
      "senderId":this.senderId,
      "receiverId":this.recieverId,
      "amount":this.amount,
      "password":this.password 
  }
  console.log(this.user);
  this.service.sendAmount(this.user).subscribe((res:any)=>{
    alert(res.message);
    if(res.message=="Transaction successful"){
      const randomIndex = Math.floor(Math.random() * this.rewardsimgs.length);
      this.selectedImg = this.rewardsimgs[randomIndex];
      this.selectedmsg = this.rewardmsg[randomIndex];
    } 

  })
}
sendAgain(){
  this.selectedImg = null;
}

}
