import { ApplicationRef, DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { concat, filter, first, fromEvent, interval, mapTo, mergeMap } from 'rxjs';

/**
 * Monitors service worker versions and reloads the app when a new build is ready.
 * Also performs periodic update checks while the app is in use.
 */
@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private static readonly CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

  private readonly appRef = inject(ApplicationRef);
  private readonly swUpdate = inject(SwUpdate);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.watchForReadyVersions();
    this.scheduleUpdateChecks();
  }

  private watchForReadyVersions(): void {
    this.swUpdate.versionUpdates
      .pipe(
        filter((event): event is Extract<VersionEvent, { type: 'VERSION_READY' }> => event.type === 'VERSION_READY'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(async () => {
        await this.swUpdate.activateUpdate();
        window.location.reload();
      });
  }

  private scheduleUpdateChecks(): void {
    const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable));
    const onVisible$ = fromEvent(document, 'visibilitychange').pipe(
      filter(() => document.visibilityState === 'visible'),
      mapTo(undefined),
    );

    concat(appIsStable$, interval(PwaUpdateService.CHECK_INTERVAL_MS).pipe(mapTo(undefined)), onVisible$)
      .pipe(
        mergeMap(() => this.swUpdate.checkForUpdate()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
