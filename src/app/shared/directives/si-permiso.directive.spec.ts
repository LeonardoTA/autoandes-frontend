import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiPermiso } from './si-permiso.directive';
import { AuthService } from '../../core/auth/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

@Component({
  template: `
    <div id="test-el" *siPermiso="'SERVICIO_ESCRIBIR'">Contenido Protegido</div>
  `,
  standalone: true,
  imports: [SiPermiso]
})
class TestHostComponent {}

describe('SiPermiso Directive', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        AuthService,
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
  });

  it('should render element when user has permission', () => {
    spyOn(authService, 'hasPermiso').and.returnValue(true);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('#test-el');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain('Contenido Protegido');
  });

  it('should NOT render element when user lacks permission', () => {
    spyOn(authService, 'hasPermiso').and.returnValue(false);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('#test-el');
    expect(el).toBeNull();
  });
});
