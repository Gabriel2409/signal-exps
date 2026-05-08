import { JsonPipe } from '@angular/common';
import { Component, resource, signal } from '@angular/core';
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
  validateAsync,
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
    // custom validator ----------
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

    // custom validator across multiple fields
    validate(s.confirmPassword, ({ value, valueOf }) => {
      const password = valueOf(s.password);
      const confirmPassword = value();
      if (!password || !confirmPassword) {
        // let other validators handle this
        return null;
      }
      if (password != confirmPassword) {
        return {
          // returns the error type
          kind: 'password_mismatch',
          // error message
          message: "Your passwords don't match",
        };
      }
      // no errors
      return null;
    });

    // async validator, exposes a pending signal on the field
    validateAsync(s.username, {
      params: ({ value }) => {
        const val = value();
        if (!val || val.length < 3) {
          // undefined tells signal forms not to run the async validator right now
          return undefined;
        }
        // value for the next step
        return val;
      },
      factory: (params) =>
        // creates a resource from the params that tracks the async operation
        resource({
          params,
          loader: async ({ params }) => {
            const username = params;
            const available = await this.checkUsernameAvailability(username);
            return available;
          },
        }),
      // what happens if the async validator does not throw an error
      onSuccess: (result: boolean) => {
        if (result === false) {
          return {
            kind: 'username_taken',
            message: 'This username is already taken',
          };
          // no async errors
        }
        return null;
      },
      // what happens if the async validator throws an error, for ex if there is a
      // network problem
      onError: (error: unknown) => {
        console.log('Validation error', error);
        // here we dont block the form in case of unexpected errrors but in real app,
        // we probably should
        return null;
      },
    });
  });

  private checkUsernameAvailability(username: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const taken = ['admin', 'test', 'brian'];
        resolve(!taken.includes(username.toLowerCase()));
      }, 1000);
    });
  }
}
