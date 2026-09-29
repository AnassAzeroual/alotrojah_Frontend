import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateLoader, provideTranslateService, TranslateNoOpLoader } from '@ngx-translate/core';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;
  let cmp: StatusBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
      providers: [provideTranslateService({ loader: provideTranslateLoader(() => new TranslateNoOpLoader()) })],
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBadgeComponent);
    cmp = fixture.componentInstance;
  });

  it('labels attendance states', () => {
    fixture.componentRef.setInput('kind', 'attendance');
    fixture.componentRef.setInput('value', 'present');
    expect(cmp.labelKey()).toBe('attendance.present');
    expect(cmp.badgeClass()).toBe('badge ok');
  });

  it('marks absences bad and warnings warn', () => {
    fixture.componentRef.setInput('kind', 'attendance');
    fixture.componentRef.setInput('value', 'absent');
    expect(cmp.badgeClass()).toBe('badge bad');
    fixture.componentRef.setInput('value', 'late');
    expect(cmp.badgeClass()).toBe('badge warn');
  });

  it('labels honor flags', () => {
    fixture.componentRef.setInput('kind', 'honor');
    fixture.componentRef.setInput('value', 'tashji3');
    expect(cmp.labelKey()).toBe('honor.tashji3');
    expect(cmp.badgeClass()).toBe('badge ok');
  });
});
