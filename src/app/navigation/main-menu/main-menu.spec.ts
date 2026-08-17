import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

import { MainMenu } from './main-menu';

@Component({ template: '' })
class DummyComponent {}

describe('MainMenu', () => {
  let component: MainMenu;
  let fixture: ComponentFixture<MainMenu>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainMenu],
      providers: [
        provideRouter([
          { path: 'meal-plan', component: DummyComponent },
          { path: 'meals', component: DummyComponent },
          { path: 'shopping-list', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MainMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isHidden()).toBe(false);
  });

  it('should hide bottom-menu on scroll down', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.isHidden()).toBe(true);
    const menuElement = fixture.debugElement.query(By.css('.bottom-menu'));
    expect(menuElement.nativeElement.classList.contains('hidden')).toBe(true);
  });

  it('should not show bottom-menu on slow scroll up', () => {
    let mockTime = 1000;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => mockTime);

    // First scroll down at t=1000
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(component.isHidden()).toBe(true);

    // Small scroll up of 15px after 100ms at t=1100 (velocity = 15 / 100 = 0.15 px/ms < 0.8)
    mockTime = 1100;
    Object.defineProperty(window, 'scrollY', { value: 185, writable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.isHidden()).toBe(true);
    const menuElement = fixture.debugElement.query(By.css('.bottom-menu'));
    expect(menuElement.nativeElement.classList.contains('hidden')).toBe(true);

    nowSpy.mockRestore();
  });

  it('should show bottom-menu on fast scroll up', () => {
    // First scroll down
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(component.isHidden()).toBe(true);

    // Fast scroll up (delta >= 40px)
    Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.isHidden()).toBe(false);
    const menuElement = fixture.debugElement.query(By.css('.bottom-menu'));
    expect(menuElement.nativeElement.classList.contains('hidden')).toBe(false);
  });

  it('should show bottom-menu when at the top of the page', () => {
    // First scroll down
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(component.isHidden()).toBe(true);

    // Scroll back to top
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.isHidden()).toBe(false);
  });

  it('should render both bottom-menu and sidebar-nav with matching routes and icons', () => {
    const bottomButtons = fixture.debugElement.queryAll(By.css('.bottom-menu button[mat-button]'));
    const sidebarButtons = fixture.debugElement.queryAll(By.css('.sidebar-nav button[mat-button]'));

    expect(bottomButtons.length).toBe(3);
    expect(sidebarButtons.length).toBe(3);

    const bottomIcons = bottomButtons.map((b) => b.query(By.css('mat-icon')).nativeElement.textContent.trim());
    const sidebarIcons = sidebarButtons.map((b) => b.query(By.css('mat-icon')).nativeElement.textContent.trim());

    expect(bottomIcons).toEqual(['calendar_today', 'restaurant', 'shopping_cart']);
    expect(sidebarIcons).toEqual(['calendar_today', 'restaurant', 'shopping_cart']);
  });

  it('should apply active class to the selected route button on both menus', async () => {
    await router.navigate(['/meal-plan']);
    fixture.detectChanges();

    const bottomButtons = fixture.debugElement.queryAll(By.css('.bottom-menu button[mat-button]'));
    const sidebarButtons = fixture.debugElement.queryAll(By.css('.sidebar-nav button[mat-button]'));

    expect(bottomButtons[0].nativeElement.classList.contains('active')).toBe(true);
    expect(bottomButtons[1].nativeElement.classList.contains('active')).toBe(false);
    expect(bottomButtons[2].nativeElement.classList.contains('active')).toBe(false);

    expect(sidebarButtons[0].nativeElement.classList.contains('active')).toBe(true);
    expect(sidebarButtons[1].nativeElement.classList.contains('active')).toBe(false);
    expect(sidebarButtons[2].nativeElement.classList.contains('active')).toBe(false);

    await router.navigate(['/meals']);
    fixture.detectChanges();

    expect(bottomButtons[0].nativeElement.classList.contains('active')).toBe(false);
    expect(bottomButtons[1].nativeElement.classList.contains('active')).toBe(true);
    expect(bottomButtons[2].nativeElement.classList.contains('active')).toBe(false);

    expect(sidebarButtons[0].nativeElement.classList.contains('active')).toBe(false);
    expect(sidebarButtons[1].nativeElement.classList.contains('active')).toBe(true);
    expect(sidebarButtons[2].nativeElement.classList.contains('active')).toBe(false);

    await router.navigate(['/shopping-list']);
    fixture.detectChanges();

    expect(bottomButtons[0].nativeElement.classList.contains('active')).toBe(false);
    expect(bottomButtons[1].nativeElement.classList.contains('active')).toBe(false);
    expect(bottomButtons[2].nativeElement.classList.contains('active')).toBe(true);

    expect(sidebarButtons[0].nativeElement.classList.contains('active')).toBe(false);
    expect(sidebarButtons[1].nativeElement.classList.contains('active')).toBe(false);
    expect(sidebarButtons[2].nativeElement.classList.contains('active')).toBe(true);
  });
});
