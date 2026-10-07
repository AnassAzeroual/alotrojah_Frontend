import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

const SLIDES = [
  { src: 'assets/auth/slide-1.jpg', caption: 'auth.art_caption' },
  { src: 'assets/auth/slide-2.jpg', caption: 'auth.art_hint' },
] as const;

const INTERVAL_MS = 10_000;
const SWIPE_PX = 40;

/** Auth art carousel: 2 photos, crossfade, auto-advance every 10s, arrows/dots/swipe. */
@Component({
  selector: 'app-auth-art',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="art-slides"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)"
      (mouseenter)="paused.set(true)"
      (mouseleave)="paused.set(false)"
    >
      @for (s of slides; track s.src; let i = $index) {
        <img
          class="slide"
          [class.on]="i === index()"
          [src]="s.src"
          [alt]="s.caption | translate"
          [loading]="i === 0 ? 'eager' : 'lazy'"
          [attr.fetchpriority]="i === 0 ? 'high' : null"
          draggable="false"
        />
      }
      <span class="art-dots" aria-hidden="true">
        @for (s of slides; track s.src; let i = $index) {
          <i [class.on]="i === index()"></i>
        }
      </span>
      <div class="art-cap">
        <p>{{ slides[index()].caption | translate }}</p>
      </div>
      <div class="art-nav">
        <button type="button" tabindex="-1" (click)="prev()" aria-hidden="true">‹</button>
        <button type="button" tabindex="-1" (click)="next()" aria-hidden="true">›</button>
      </div>
    </div>
  `,
})
export class AuthArtComponent implements OnDestroy {
  readonly slides = SLIDES;
  readonly index = signal(0);
  readonly paused = signal(false);

  private touchX: number | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this.timer = setInterval(() => {
      if (!this.paused() && !document.hidden) this.next();
    }, INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.timer !== null) clearInterval(this.timer);
  }

  next(): void {
    this.index.update((i) => (i + 1) % this.slides.length);
  }

  prev(): void {
    this.index.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }

  onTouchStart(e: TouchEvent): void {
    this.touchX = e.touches[0]?.clientX ?? null;
  }

  onTouchEnd(e: TouchEvent): void {
    if (this.touchX === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? this.touchX) - this.touchX;
    this.touchX = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    if (dx < 0) this.next();
    else this.prev();
  }
}
