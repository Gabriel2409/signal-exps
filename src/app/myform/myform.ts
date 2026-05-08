import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';

interface SignupForm {
  username: string;
}

@Component({
  selector: 'app-myform',
  imports: [FormField, FormRoot, JsonPipe],
  templateUrl: './myform.html',
  styleUrl: './myform.scss',
})
export class Myform {
  protected myformModel = signal<SignupForm>({
    username: '',
  });

  protected form = form(this.myformModel, (s) => {}, {
    submission: {
      action: async (f) => {
        this.myformModel.set({ username: 'aaa' });
      },
    },
  });
}
