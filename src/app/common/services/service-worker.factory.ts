import { SwRegistrationOptions } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { ServiceWorkerRegistrationService } from './service-worker-registration.service';
import { tap } from 'rxjs/operators';

export function serviceWorkerInitFactory(swRegistrationService: ServiceWorkerRegistrationService): SwRegistrationOptions {
  return {
    enabled: environment.production,
    registrationStrategy: () =>
      swRegistrationService.getSignedInObervable().pipe(
        tap(() => console.log('ServiceWorker Registered.'))
      )
  };
}

