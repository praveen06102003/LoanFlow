import { Component, OnInit, HostListener  } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {

  customerName = 'Customer';
  loans: any[] = [];
  loading = true;
  errorMessage = '';
  showProfileMenu = false;

  stats = [
    { title: 'Total Applications', value: 0, icon: 'file', color: 'blue' },
    { title: 'Pending Review', value: 0, icon: 'clock', color: 'orange' },
    { title: 'Approved Loans', value: 0, icon: 'check', color: 'green' },
    { title: 'Rejected Loans', value: 0, icon: 'close', color: 'red' }
  ];

  constructor(private loanService: LoanService,public router: Router) {}

  ngOnInit(): void {
    this.loadCustomerProfile();

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    this.loanService.getCurrentUser().subscribe({
      next: (user) => {
        this.customerName = user.full_name;
      },
      error: (error) => console.error('User loading failed:', error)
    });

    this.loanService.getLoans().subscribe({
      next: (loans) => {
        this.loans = loans.sort(
          (a, b) => new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
        );

        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Loan loading failed:', error);
        this.errorMessage = 'Unable to load your loan applications.';
        this.loading = false;
      }
    });
  }

  updateStats(): void {
    this.stats[0].value = this.loans.length;
    this.stats[1].value = this.loans.filter(
      loan => loan.status === 'PENDING_REVIEW'
    ).length;
    this.stats[2].value = this.loans.filter(
      loan => loan.status === 'APPROVED'
    ).length;
    this.stats[3].value = this.loans.filter(
      loan => loan.status === 'REJECTED'
    ).length;
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }
  get customerInitials(): string {
  const name = this.customerName.trim();

  if (!name) return 'U';

  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}
loadCustomerProfile(): void {
  this.loanService.getCurrentUser().subscribe({
    next: (user) => {
      this.customerName = user.full_name || 'Customer';
    },
    error: (error) => {
      console.error('Unable to load customer profile', error);
    }
  });
}
@HostListener('document:click', ['$event'])
closeLogoutDropdown(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  if (!target.closest('.profile-menu')) {
    this.showLogout = false;
  }
}
showLogout = false;
logout(): void {
  sessionStorage.removeItem('access_token');
  window.location.href = '/';
}
}