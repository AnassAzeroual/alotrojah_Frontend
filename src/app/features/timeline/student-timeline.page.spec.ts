import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { throwError } from 'rxjs';
import { TimelineService } from '../../core/api/timeline.service';
import { StudentTimelinePage } from './student-timeline.page';

describe('StudentTimelinePage', () => {
  const timelineStub = {
    get: vi.fn(() => throwError(() => new Error('not found'))),
  };

  beforeEach(async () => {
    timelineStub.get.mockClear();
    await TestBed.configureTestingModule({
      imports: [StudentTimelinePage],
      providers: [
        provideRouter([]),
        provideTranslateService({ loader: provideTranslateLoader(TranslateNoOpLoader) }),
        { provide: TimelineService, useValue: timelineStub },
      ],
    }).compileComponents();
  });

  it('shows an error state instead of the no-data empty state', async () => {
    const fixture = TestBed.createComponent(StudentTimelinePage);
    fixture.componentRef.setInput('id', '999999');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.timeline-error')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });
});
