import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { environment } from '@app/environments';
import { Observable } from 'rxjs';

export function apiBaseUrlInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (request.url.includes('i18n')) {
    return next(request);
  }
  const apiReq = request.clone({ url: `${environment.apiUrl}${request.url}` });
  return next(apiReq);
}
