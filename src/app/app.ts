import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  imports: [RouterOutlet, TranslatePipe],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly translate = inject(TranslateService);

  constructor() {
    this.translate.use('ar');
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  }
}
