import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { DropdownComponent } from './dropdown.component';

@Component({
  standalone: true,
  imports: [DropdownComponent, ReactiveFormsModule],
  template: `<app-dropdown
    [options]="[
      { value: 'a', labelKey: 'x.a' },
      { value: 'b', label: 'Bee' },
    ]"
    [formControl]="control"
  />`,
})
class CvaHost {
  readonly control = new FormControl<string | null>('a');
}

describe('DropdownComponent', () => {
  let fixture: ComponentFixture<DropdownComponent>;
  let cmp: DropdownComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
      providers: [
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DropdownComponent);
    cmp = fixture.componentInstance;
    fixture.componentRef.setInput('options', [
      { value: '', labelKey: 'list.all' },
      { value: 'a', label: 'Alpha' },
    ]);
    fixture.detectChanges();
  });

  it('shows the selected option label', () => {
    fixture.componentRef.setInput('value', 'a');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dd-label').textContent).toContain('Alpha');
  });

  it('emits the chosen value in signal mode', () => {
    const seen: unknown[] = [];
    cmp.valueChange.subscribe((v) => seen.push(v));
    (fixture.nativeElement.querySelector('.dd-btn') as HTMLElement).click();
    fixture.detectChanges();
    const second = fixture.nativeElement.querySelectorAll('.dd-list button')[1] as HTMLElement;
    second.click();
    fixture.detectChanges();
    expect(seen).toEqual(['a']);
  });

  it('works as a form control', async () => {
    const host = TestBed.createComponent(CvaHost);
    host.detectChanges();
    host.componentInstance.control.setValue('b');
    host.detectChanges();
    await host.whenStable();
    expect(host.nativeElement.querySelector('.dd-label').textContent).toContain('Bee');
  });
});
