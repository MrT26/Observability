import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent {
  customers: any[] = [];
  branches: any[] = [];
  customersWithBranches: any[] = [];
  user: any;
  username: any;
  email: any;mobile:any;gender:any;accounttype:any;branch:any;
  availableBalance:any;
  password: any;
  confirmPassword: any;selectedBranchId:any
  branchNames:any
  constructor(private data: DataService,private service:LoginService,private router:Router) {}

  ngOnInit() {

    // Fetch customers and cast response as an array
    this.data.getCustomers().subscribe((res: any) => {
      this.customers = res || []; // Safeguard: Ensure res is an array
      this.empnameswithbranch(); // Try matching customers and branches after customers are fetched
    });

    // Fetch branches and cast response as an array
    this.data.getBranches().subscribe((res: any) => {
      this.branches = res || []; // Safeguard: Ensure res is an array
      this.empnameswithbranch(); // Try matching customers and branches after branches are fetched
    });
  }

  empnameswithbranch() {
    // Ensure both customers and branches are defined and non-empty
    if (this.customers.length > 0 && this.branches.length > 0) {
      this.customersWithBranches = this.customers.map((customer: any) => {
        const branch = this.branches.find((br: any) => br._id === customer.branch); // Match branch by ID
        return {
          ...customer,
          branchName: branch ? branch.branchName : 'No Branch Assigned' // Assign branch name or fallback
        };
      });
      console.log(this.customersWithBranches); // Log to verify the result
    }
  }
  
  registernow() {
    if (this.password === this.confirmPassword) {
      this.user = {
        "name": this.username,
        "email": this.email,
        "password": this.password,
        "mobile":this.mobile,
        "gender":this.gender,
        "accountType":this.accounttype,
        "branch":this.selectedBranchId,
        "availableBalance":this.availableBalance,
        "role":"customer"
      };

      this.service.signup(this.user).subscribe(
        (res: any) => {
          alert(res.message); // Display the message property from the response
          //localStorage.setItem("loginuser", JSON.stringify(this.user));
          // Redirect or perform other actions on successful registration
          this.ngOnInit();
        },
        (error) => {
          console.error(error);
          if (error.error && error.error.error) {
            alert(error.error.error); // Display the error message from the response
          } else {
            alert("Error occurred while signing up."); // Display a generic error message
          }
        }
      );
    }
  }

}
