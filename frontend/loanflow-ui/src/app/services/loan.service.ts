import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/auth/me`,
      { headers: this.getHeaders() }
    );
  }

  getLoans(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/loans`,
      { headers: this.getHeaders() }
    );
  }
  createLoan(loan: any): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/loans`,
    loan,
    { headers: this.getHeaders() }
  );
}
getAllLoans(): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/loans`,
    { headers: this.getHeaders() }
  );
}

decideLoan(id: number, status: 'APPROVED' | 'REJECTED', reason: string): Observable<any> {
  return this.http.patch(
    `${this.apiUrl}/loans/${id}/decision`,
    {
      status: status,
      decision_reason: reason || null
    },
    { headers: this.getHeaders() }
  );
}
getMyProfile(): Observable<any> {
  return this.http.get(`${this.apiUrl}/auth/me`, {
    headers: this.getHeaders()
  });
}

updateMyProfile(data: any): Observable<any> {
  return this.http.patch(`${this.apiUrl}/auth/me`, data, {
    headers: this.getHeaders()
  });
}
}