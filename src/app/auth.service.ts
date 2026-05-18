import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedInUser: string | null = null;

  login(email: string, password: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    const namePart = email.split('@')[0];
    this.loggedInUser = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    return true;
  }

  getUser(): string | null {
    return this.loggedInUser;
  }

  logout(): void {
    this.loggedInUser = null;
  }
}
