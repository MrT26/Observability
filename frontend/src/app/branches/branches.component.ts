import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent {

  constructor(private service:DataService){}
  branches:any;
  bName:any;
  ifsc:any;
  bmanager:any;
  bcontact:any;
  baddress:any;newbranch:any;
  ngOnInit(){
    this.service.getBranches().subscribe((res)=>{
      this.branches=res;
    })
  }
  addbranch(){
    this.newbranch = {
      "branchName":this.bName,
      "ifscCode":this.ifsc,
      "branchManager":this.bmanager,
      "contactDetails":this.bcontact,
      "address":this.baddress
    }
    this.service.addbranch(this.newbranch).subscribe((res)=>{
      alert("Branch added successfully");
      this.ngOnInit();
    })
  }

}
