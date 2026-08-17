import {
  afterNextRender,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';

/**
 * Emits `true` when the host element scrolls into the viewport (expanded by
 * `inViewportMargin`) and `false` when it leaves. Useful as an infinite-scroll sentinel.
 */
@Directive({
  selector: '[appInViewport]',
})
export class InViewport {
  /** CSS margin around the viewport, so content can load before it's actually visible. */
  readonly inViewportMargin = input('200px');

  /**
   * Re-reports the current visibility whenever this value changes. Intersection
   * observers only emit on *changes*, so after content is added above the sentinel
   * (e.g. a page of results that still doesn't fill the screen) it would otherwise
   * stay silent while remaining visible.
   */
  readonly inViewportRecheckOn = input<unknown>();

  readonly inViewportChange = output<boolean>();

  private observer?: IntersectionObserver;

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;

      this.observer = new IntersectionObserver(
        (entries) => this.inViewportChange.emit(entries.some((entry) => entry.isIntersecting)),
        { rootMargin: this.inViewportMargin() },
      );
      this.observer.observe(element);
    });

    effect(() => {
      this.inViewportRecheckOn();
      // Re-observing makes the observer deliver a fresh entry, computed after layout.
      untracked(() => {
        this.observer?.unobserve(element);
        this.observer?.observe(element);
      });
    });

    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }
}
