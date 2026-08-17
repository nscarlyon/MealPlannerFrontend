import { Component, HostListener, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-main-menu',
  imports: [MatIconModule, MatMenuModule, RouterModule, MatButton],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.scss',
})
export class MainMenu {
  readonly isHidden = signal<boolean>(false);
  private lastScrollY = 0;
  private lastScrollTime = 0;
  private readonly scrollThreshold = 10;
  private readonly fastScrollUpVelocity = 0.8;
  private readonly fastScrollUpDelta = 40;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const rawTimeDelta = this.lastScrollTime ? now - this.lastScrollTime : 0;
    const timeDelta = rawTimeDelta > 0 ? rawTimeDelta : 100;
    const delta = currentScrollY - this.lastScrollY;
    const atTheTop = currentScrollY <= 0;

    if (atTheTop) {
      this.isHidden.set(false);
      this.lastScrollY = 0;
      this.lastScrollTime = now;
      return;
    }

    const userScrolls = Math.abs(delta) > this.scrollThreshold;
    const userScrollsDown = delta > 0 && currentScrollY > 50;
    const userScrollsUp = delta < 0;

    if (userScrolls) {
      if (userScrollsDown) {
        this.isHidden.set(true);
      } else if (userScrollsUp) {
        if (this.isFastScrollUp(timeDelta, delta)) {
          this.isHidden.set(false);
        }
      }
      this.lastScrollY = currentScrollY;
      this.lastScrollTime = now;
    }
  }
  private isFastScrollUp(timeDelta: number, delta: number) {
    const isRecentGesture = timeDelta <= 200;
    const velocity = Math.abs(delta) / timeDelta;
    return (Math.abs(delta) >= this.fastScrollUpDelta ||
      (isRecentGesture && velocity >= this.fastScrollUpVelocity));
  }
}
