
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  profile: any = {
    full_name: '',
    email: '',
    phone: '',
    role: ''
  };

  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private loanService: LoanService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;

    this.loanService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = { ...data };
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Unable to load profile.';
        this.loading = false;
      }
    });
  }

  saveProfile(): void {
    if (this.saving) return;

    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      full_name: this.profile.full_name.trim(),
      phone: this.profile.phone.trim()
    };

    this.saving = true;

    this.loanService.updateMyProfile(payload).subscribe({
      next: (data) => {
        this.profile = { ...data };
        this.successMessage = 'Profile updated successfully!';
        this.saving = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.detail || 'Unable to update profile.';
        this.saving = false;
      }
    });
  }

  get initials(): string {
    return this.profile.full_name
      .split(' ')
      .filter((part: string) => part.length > 0)
      .slice(0, 2)
      .map((part: string) => part[0].toUpperCase())
      .join('') || 'U';
  }

  goBack(): void {
    const route = this.profile.role === 'LOAN_OFFICER'
      ? '/officer-dashboard'
      : '/customer-dashboard';

    this.router.navigateByUrl(route);
  }
}
