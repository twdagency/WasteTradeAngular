import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { LocalStorageService } from 'app/services/local-storage.service';
import { catchError, Observable, throwError } from 'rxjs';

export function AuthInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const localStorageService = inject(LocalStorageService);
  const authService = inject(AuthService);
  const accessToken = localStorageService.getAccessToken();

  if (accessToken) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorageService.deleteAccessToken();
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
}
