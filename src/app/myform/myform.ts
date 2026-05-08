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
} from '@angular/forms/signals';

interface SignupForm {
  username: string;
  email: '';
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
    age: null,
  });

  protected form = form(this.myformModel, (s) => {
    (required(s.username, { message: 'username is required' }),
      required(s.email, { message: 'Email is required' }),
      minLength(s.username, 3, { message: 'Username must be at least 3 chars' }),
      email(s.email, { message: 'Please enter a valid email' }),
      pattern(s.username, /^[a-zA-Z0-9]+$/, { message: 'Must contain only letters and numbers' }),
      min(s.age, 13, { message: 'You must be 13 or more' }),
      max(s.age, 120, { message: 'You must be 120 or less' }));
  });
}
