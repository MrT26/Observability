import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { EmpdashboardComponent } from './empdashboard/empdashboard.component';
import { EmployeeComponent } from './employee/employee.component';
import { CustomersComponent } from './customers/customers.component';
import { BranchesComponent } from './branches/branches.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TransactionComponent } from './transaction/transaction.component';
import { HistoryComponent } from './history/history.component';
import { UserhomeComponent } from './userhome/userhome.component';
import { RegistrationComponent } from './registration/registration.component';
import { ProfileComponent } from './profile/profile.component';
import { DetailsComponent } from './details/details.component';
import { RewardsComponent } from './rewards/rewards.component';
import { EmphomeComponent } from './emphome/emphome.component';

const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'login',component:LoginComponent},
  {path:'signup',component:RegistrationComponent},
  {path:'emp',component:EmpdashboardComponent,
    children:[
      {path:'home',component:EmphomeComponent},
      {path:'employee',component:EmployeeComponent},
      {path:'customers',component:CustomersComponent},
      {path:'branches',component:BranchesComponent}
    ]
  },
  {
    path:'customer',component:NavbarComponent,
    children:[
      {path:'transfer',component:TransactionComponent},
      {path:'history',component:HistoryComponent},
      {path:'home',component:UserhomeComponent},
      {path:'profile',component:ProfileComponent},
      {path:'details',component:DetailsComponent},
      {path:'rewards',component:RewardsComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
