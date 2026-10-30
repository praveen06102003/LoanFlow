import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard.component';
import { ApplyLoanComponent } from './pages/apply-loan/apply-loan.component';
import { FormsModule } from '@angular/forms';
import { MyApplicationsComponent } from './pages/my-applications/my-applications.component';
import { OfficerDashboardComponent } from './pages/officer-dashboard/officer-dashboard.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomerDashboardComponent,
    ApplyLoanComponent,
    MyApplicationsComponent,
    OfficerDashboardComponent,
    MyProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
