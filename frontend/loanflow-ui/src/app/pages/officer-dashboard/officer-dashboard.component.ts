
import { Component, OnInit,HostListener  } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-officer-dashboard',
  templateUrl: './officer-dashboard.component.html',
  styleUrls: ['./officer-dashboard.component.css']
})
export class OfficerDashboardComponent implements OnInit {

  loans: any[] = [];
  selectedStatus = 'ALL';
  loading = true;
  errorMessage = '';
  selectedLoan: any = null;
  decisionReason = '';
  processing = false;

  officerName = '';
  showLogout = false;

  totalApplications = 0;
  pendingApplications = 0;
  approvedApplications = 0;
  rejectedApplications = 0;

  constructor(
    private loanService: LoanService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.showLogout = false;
    this.loadOfficerProfile();
    this.loadLoans();
  }

  loadOfficerProfile(): void {
    this.loanService.getCurrentUser().subscribe({
      next: user => {
        this.officerName =
          user.full_name || user.email.split('@')[0];
      },
      error: error => {
        console.error('Unable to load officer profile', error);
      }
    });
  }

  loadLoans(): void {
    this.loading = true;
    this.errorMessage = '';

    this.loanService.getAllLoans().subscribe({
      next: loans => {
        this.loans = loans.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        this.updateStats();
        this.loading = false;
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Unable to load loan applications.';
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

  updateStats(): void {
    this.totalApplications = this.loans.length;

    this.pendingApplications = this.loans.filter(
      loan => loan.status === 'PENDING_REVIEW'
    ).length;

    this.approvedApplications = this.loans.filter(
      loan => loan.status === 'APPROVED'
    ).length;

    this.rejectedApplications = this.loans.filter(
      loan => loan.status === 'REJECTED'
    ).length;
  }

  refreshLoans(): void {
    this.selectedStatus = 'ALL';
    this.loadLoans();
  }

  openLoan(loan: any): void {
    this.selectedLoan = loan;
    this.decisionReason = '';
  }

  closeLoan(): void {
    this.selectedLoan = null;
  }

  decideLoan(status: 'APPROVED' | 'REJECTED'): void {
    if (!this.selectedLoan || this.processing) return;

    if (status === 'REJECTED' && !this.decisionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    this.processing = true;

    this.loanService.decideLoan(
      this.selectedLoan.id,
      status,
      this.decisionReason.trim()
    ).subscribe({
      next: () => {
        this.processing = false;
        this.selectedLoan = null;
        this.loadLoans();
      },
      error: error => {
        this.processing = false;
        alert(error.error?.detail || 'Unable to process decision.');
      }
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }

  get officerInitials(): string {
    if (!this.officerName) return 'U';

    return this.officerName
      .trim()
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

logout(): void {
  sessionStorage.removeItem('access_token');
  window.location.href = '/';
}

toggleLogoutMenu(): void {
  this.showLogout = !this.showLogout;
}

closeLogoutMenu(): void {
  this.showLogout = false;
}
onStatusChange(status: string): void {
  this.selectedStatus = status;
}
@HostListener('document:click', ['$event'])
closeLogoutDropdown(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  if (!target.closest('.profile-menu')) {
    this.showLogout = false;
  }
}
}
