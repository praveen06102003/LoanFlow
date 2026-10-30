import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-apply-loan',
  templateUrl: './apply-loan.component.html',
  styleUrls: ['./apply-loan.component.css']
})
export class ApplyLoanComponent {
  loanAmount: number | null = null;
  purpose = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private loanService: LoanService,
    private router: Router
  ) {}

  goToDashboard(): void {
  this.router.navigate(['/customer-dashboard']);
}
  submitApplication(): void {
    if (!this.loanAmount || this.loanAmount <= 0 || this.purpose.trim().length < 3) {
      this.errorMessage = 'Enter a valid amount and loan purpose.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.loanService.createLoan({
      loan_amount: this.loanAmount,
      purpose: this.purpose.trim()
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Loan application submitted successfully!';

        setTimeout(() => {
          this.router.navigate(['/customer-dashboard']);
        }, 1200);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.detail || 'Unable to submit your application.';
      }
    });
  }
}