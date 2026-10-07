import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { PasswordFieldComponent } from './password-field.component';

@Component({
  template: `<app-password-field [control]="control" testId="pw" />`,
  standalone: true,
  imports: [ReactiveFormsModule, PasswordFieldComponent],
})
class HostComponent {
  readonly control = new FormControl('', { nonNullable: true });
}

describe('PasswordFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  const inputOf = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[data-testid="pw"]') as HTMLInputElement;

  it('starts masked with the login aria-label', () => {
    const input = inputOf();
    expect(input.type).toBe('password');
    expect(input.getAttribute('aria-label')).toBe('auth.password');
  });

  it('toggles visibility and writes through to the control', () => {
    const toggle = fixture.nativeElement.querySelector(
      '[data-testid="pw-visibility"]',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(inputOf().type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('auth.hide_password');

    const host = fixture.componentInstance;
    host.control.setValue('secret123');
    fixture.detectChanges();
    expect(inputOf().value).toBe('secret123');
  });
});
