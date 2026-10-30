import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {

  loans: any[] = [];
  loading = true;
  errorMessage = '';
  selectedStatus = 'ALL';

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loanService.getLoans().subscribe({
      next: (data) => {
        this.loans = data.sort(
          (a, b) => new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Unable to load applications.';
        this.loading = false;
      }
    });
  }

  get filteredLoans(): any[] {
    if (this.selectedStatus === 'ALL') {
      return this.loans;
    }

    return this.loans.filter(
      loan => loan.status === this.selectedStatus
    );
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }
}