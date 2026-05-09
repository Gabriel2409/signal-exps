import { JsonPipe } from '@angular/common';
import { Component, inject, resource, signal } from '@angular/core';
import {
  applyEach,
  debounce,
  disabled,
  email,
  form,
  FormField,
  hidden,
  max,
  min,
  minLength,
  pattern,
  readonly,
  required,
  validate,
  validateAsync,
} from '@angular/forms/signals';
import { UserIdMockService } from './user-id.service';

interface SignupForm {
  id: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number | null;
  guardianName: string;
  newsletter: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  alternateEmails: string[];
}

@Component({
  selector: 'app-myform',
  imports: [FormField, JsonPipe],
  templateUrl: './myform.html',
  styleUrl: './myform.scss',
})
export class Myform {
  private userId = inject(UserIdMockService).getUserId();

  protected myformModel = signal<SignupForm>({
    id: this.userId,
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: null,
    guardianName: '',
    newsletter: false,
    frequency: 'monthly',
    alternateEmails: [],
  });

  protected form = form(this.myformModel, (s) => {
    // ---- BASIC PATTERNS, + error messages if not respected ----
    required(s.username, { message: 'username is required' });
    minLength(s.username, 3, { message: 'Username must be at least 3 chars' });
    pattern(s.username, /^[a-zA-Z0-9]+$/, { message: 'Must contain only letters and numbers' });
    required(s.email, { message: 'Email is required' });
    email(s.email, { message: 'Please enter a valid email' });
    min(s.age, 13, { message: 'You must be 13 or more' });
    max(s.age, 120, { message: 'You must be 120 or less' });
    required(s.password, { message: 'Please enter a password' });

    // ------- CUSTOM VALIDATOR ----------
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
        return {
          kind: 'unknow_error',
          message: 'An error occured, please try again later',
        };
      },
    });

    // prevents too many ui updates
    debounce(s.username, 500);

    // adds the readonly attribute to id field, without any condition
    readonly(s.id);
    // frequency is enabled only if newsletter is checked. If condition is respected,
    // adds the disabled attribute to the template
    disabled(s.frequency, ({ valueOf }) => !valueOf(s.newsletter));
    // contrary to disabled and readonly, hidden does not add an hidden attribute or
    // class in the template. We need to add a condition on form.guardianName().hidden()
    // in the template
    // NOTE: it is still useful if we forget to hide it in the template
    // as a hidden field is not part of the validation
    hidden(s.guardianName, ({ valueOf }) => (valueOf(s.age) || 0) >= 18);
    required(s.guardianName, {
      message: 'Guardian name is required',
      // Here, we have a when condition so it is only required if the condition is satisfied
      when: ({ valueOf }) => (valueOf(s.age) || 0) < 18,
    });

    // For array fields, no need for formArrays anymore.
    // applyEach applies validation to all elements of the array
    applyEach(s.alternateEmails, (e) => {
      required(e, { message: "Alternate email can't be empty" });
      email(e, { message: 'Please enter a valid email' });
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

  // We just need 2 methods to correctly update the signal to add and delete alternate
  // emails.
  protected addAlternateEmail() {
    this.myformModel.update((current) => ({
      ...current,
      alternateEmails: [...current.alternateEmails, ''],
    }));
  }
  protected removeAlternateEmail(index: number) {
    this.myformModel.update((current) => ({
      ...current,
      alternateEmails: current.alternateEmails.filter((_, i) => i !== index),
    }));
  }
}
