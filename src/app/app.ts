import { Component, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/ui/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    afterNextRender(() => {
      const splash = document.getElementById('app-splash');
      if (splash && !splash.classList.contains('fade-out')) {
        splash.classList.add('fade-out');
        setTimeout(() => {
          if (splash.parentNode) {
            splash.parentNode.removeChild(splash);
          }
        }, 360);
      }
    });
  }
}

