import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateLoader, provideTranslateService, TranslateNoOpLoader } from '@ngx-translate/core';
import { ScoreInputComponent } from './score-input.component';

describe('ScoreInputComponent', () => {
  let fixture: ComponentFixture<ScoreInputComponent>;
  let cmp: ScoreInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreInputComponent],
      providers: [provideTranslateService({ loader: provideTranslateLoader(() => new TranslateNoOpLoader()) })],
    }).compileComponents();
    fixture = TestBed.createComponent(ScoreInputComponent);
    cmp = fixture.componentInstance;
    fixture.componentRef.setInput('max', 14);
    fixture.detectChanges();
  });

  it('emits numbers on input, null on clear', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = '12.5';
    input.dispatchEvent(new Event('input'));
    expect(cmp.value()).toBe(12.5);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(cmp.value()).toBeNull();
  });

  it('respects the disabled flag', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBe(true);
  });
});
