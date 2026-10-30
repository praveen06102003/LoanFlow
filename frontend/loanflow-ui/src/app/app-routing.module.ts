import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard.component';
import { ApplyLoanComponent } from './pages/apply-loan/apply-loan.component';
import { MyApplicationsComponent } from './pages/my-applications/my-applications.component';
import { OfficerDashboardComponent } from './pages/officer-dashboard/officer-dashboard.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';

const routes: Routes = [
  { path: 'customer-dashboard', component: CustomerDashboardComponent },
  { path: 'apply-loan', component: ApplyLoanComponent },
  { path: 'my-applications', component: MyApplicationsComponent },
  { path: 'officer-dashboard', component: OfficerDashboardComponent },
  { path: 'my-profile', component: MyProfileComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}