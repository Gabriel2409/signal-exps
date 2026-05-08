import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  max,
  min,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';

interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number | null;
}

@Component({
  selector: 'app-myform',
  imports: [FormField, JsonPipe],
  templateUrl: './myform.html',
  styleUrl: './myform.scss',
})
export class Myform {
  protected myformModel = signal<SignupForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: null,
  });

  protected form = form(this.myformModel, (s) => {
    required(s.username, { message: 'username is required' });
    minLength(s.username, 3, { message: 'Username must be at least 3 chars' });
    pattern(s.username, /^[a-zA-Z0-9]+$/, { message: 'Must contain only letters and numbers' });
    required(s.email, { message: 'Email is required' });
    email(s.email, { message: 'Please enter a valid email' });
    min(s.age, 13, { message: 'You must be 13 or more' });
    max(s.age, 120, { message: 'You must be 120 or less' });
    required(s.password, { message: 'Please enter a password' });
    // custom validator
    validate(s.password, ({ value }) => {
      const password = value();
      if (!password) {
        // let required validator handle it
        return null;
      }
      if (password.includes(' ')) {
        return {
          // returns the error type
          kind: 'no_space',
          // error message
          message: 'Your password cannot contain spaces',
        };
      }
      // no errors
      return null;
    });
  });
}
