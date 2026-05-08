import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Myform } from './myform/myform';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Myform],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('signal-exps');
}
