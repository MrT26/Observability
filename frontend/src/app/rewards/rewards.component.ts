import { Component } from '@angular/core';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.css'
})
export class RewardsComponent {
  rewardsimgs=[
    "assets/images/rewards/1.png",
    "assets/images/rewards/2.png",
    "assets/images/rewards/3.png",
    "assets/images/rewards/4.jpeg",
  ]

  copyCode(code: string): void {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert('Coupon code copied to clipboard!');
      })
      .catch(err => {
        console.error('Error copying code: ', err);
      });
  }
}
