
import { Component, OnInit,NgZone } from '@angular/core';
import { Router } from '@angular/router';
declare const google: any;



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user: any = null;
  errorMessage = '';
  accessToken: string | null = null;
  showLogout = false;
  private clientId = '346978722858-hjdunkhk5s61bjemkq301t1gmgvr5i8v.apps.googleusercontent.com';
  ngOnInit(): void {
    this.initializeGoogleSignIn();
  }

constructor(private router: Router, private ngZone: NgZone) {}

get isDashboardRoute(): boolean {
  return this.router.url.startsWith('/customer-dashboard');
}

initializeGoogleSignIn(): void {
  const renderGoogleButton = () => {
    const googleApi = (window as any).google;
    const button = document.getElementById('google-button');

    if (!googleApi?.accounts?.id || !button) {
      setTimeout(renderGoogleButton, 300);
      return;
    }

    button.innerHTML = '';

    googleApi.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => {
  this.ngZone.run(() => {
    this.handleGoogleLogin(response);
  });
}
    });

    googleApi.accounts.id.renderButton(button, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 280
    });
  };

  renderGoogleButton();
}



async handleGoogleLogin(response: any): Promise<void> {
  this.errorMessage = '';

  try {
    const result = await fetch('http://localhost:8000/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: response.credential
      })
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.detail || 'Google login failed');
    }

    // Only update the UI when the expected user data exists.
    if (!data.user || !data.user.email || !data.user.role || !data.access_token) {
      console.error('Unexpected backend response:', data);
      throw new Error('Login response is missing user details or access token.');
    }

    console.log('Google login response received successfully.');

    this.user = data.user;

    // Keep the token in memory for now.
    // We'll use it when connecting protected APIs.
    this.accessToken = data.access_token;
    sessionStorage.setItem('access_token', data.access_token);

if (data.user.role === 'CUSTOMER') {
  await this.router.navigate(['/customer-dashboard']);
} else if (data.user.role === 'LOAN_OFFICER') {
  await this.router.navigate(['/officer-dashboard']);
}

  } catch (error) {
    console.error('Login error:', error);
    this.user = null;
    this.errorMessage =
      error instanceof Error ? error.message : 'Login failed';
  }
}
get isApplyLoanRoute(): boolean {
  return this.router.url.startsWith('/apply-loan');
}
get isMyApplicationsRoute(): boolean {
  return this.router.url.startsWith('/my-applications');
}
get isOfficerRoute(): boolean {
  return this.router.url.startsWith('/officer-dashboard');
}
get isProfileRoute(): boolean {
  return this.router.url.startsWith('/my-profile');
}
logout(): void {
  sessionStorage.removeItem('access_token');
  this.user = null;
  this.accessToken = null;
  this.errorMessage = '';

  this.router.navigateByUrl('/');
}
}
