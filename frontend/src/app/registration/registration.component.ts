import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit {
  constructor(private db: LoginService, private data: DataService, private myrouter: Router) { }
  user: any;
  username: any;
  email: any; mobile: any; gender: any; accounttype: any; branch: any;
  availableBalance: any;
  password: any;
  confirmPassword: any; selectedBranchId: any
  branches: any = [];
  branchNames: any
  loading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.loading = true;
    this.data.getBranches().subscribe(
      (res) => {
        this.branches = res;
        console.log('Branches loaded:', this.branches);
        this.loading = false;
      },
      (error) => {
        console.error('Error loading branches:', error);
        this.errorMessage = 'Failed to load branches. Please refresh the page.';
        this.loading = false;
        alert('Error loading branches. Please make sure the backend server is running.');
      }
    );
  }

  registernow() {
    this.errorMessage = '';

    // Validate all required fields
    if (!this.username) {
      alert('Please enter a username');
      return;
    }
    if (!this.email) {
      alert('Please enter an email');
      return;
    }
    if (!this.mobile || this.mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!this.gender) {
      alert('Please select a gender');
      return;
    }
    if (!this.accounttype) {
      alert('Please select an account type');
      return;
    }
    if (!this.availableBalance || isNaN(this.availableBalance)) {
      alert('Please enter a valid opening balance');
      return;
    }
    if (!this.selectedBranchId) {
      alert('Please select a branch');
      return;
    }
    if (!this.password) {
      alert('Please enter a password');
      return;
    }
    if (!this.confirmPassword) {
      alert('Please confirm your password');
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    this.user = {
      "name": this.username,
      "email": this.email,
      "password": this.password,
      "mobile": this.mobile,
      "gender": this.gender,
      "accountType": this.accounttype,
      "branch": this.selectedBranchId,
      "availableBalance": this.availableBalance,
      "role": "customer"
    };

    console.log('Signup data:', this.user);
    this.db.signup(this.user).subscribe(
      (res: any) => {
        console.log('Signup response:', res);
        alert(res.message || 'Registration successful!');
        localStorage.setItem("loginuser", JSON.stringify(this.user));
        // Redirect to login page
        this.myrouter.navigateByUrl("/login");
      },
      (error) => {
        console.error('Signup error:', error);
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
          alert(error.error.message);
        } else if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
          alert(error.error.error);
        } else {
          this.errorMessage = "Error occurred while signing up. Please try again.";
          alert("Error occurred while signing up. Please try again.");
        }
      }
    );
  }
}
