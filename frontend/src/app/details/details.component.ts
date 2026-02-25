import { Component } from '@angular/core';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {
  username: any;
  user: any;

  constructor(private service: LoginService) {}

  getDetails() {
    this.service.getCustomerbyName(this.username).subscribe((res: any) => {
      this.user = res.user;
    });
  }

  copyCode(code: string): void {
    if (code) { // Check if code is defined
      navigator.clipboard.writeText(code)
        .then(() => {
          alert('copied to clipboard!'); // Changed alert message for clarity
        })
        .catch(err => {
          console.error('Error copying code: ', err);
        });
    } else {
      alert('No ID to copy.'); // Alert if code is undefined
    }
  }
}
