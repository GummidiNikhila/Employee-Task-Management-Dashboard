import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter email and password.';
      return;
    }
    const success = this.auth.login(this.email, this.password);
    if (success) {
      this.router.navigate(['/main']);
    } else {
      this.errorMsg = 'Please enter a valid email address.';
    }
  }
}
