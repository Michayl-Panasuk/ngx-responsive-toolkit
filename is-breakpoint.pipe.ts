import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResponsiveToolkitService } from './responsive-toolkit.service';

@Pipe({
  name: 'isBreakpoint',
  pure: false,
})
export class IsBreakpointPipe implements PipeTransform, OnDestroy {
  lastResult: boolean;
  lastParam: string;
  lastBreakpoint: string;
  subs: Subscription;
  constructor(
    private responsiveService: ResponsiveToolkitService,
    private _ref: ChangeDetectorRef
  ) {}
  transform(value: any, ...args: any[]): boolean {
    if (this.lastParam === value) {
      return this.lastResult;
    }
    if (!this.subs) {
      this.subs = this.responsiveService.currentBreakpoint$.subscribe(
        (event: string) => {
          this.updateValue(value, event);
        }
      );
    }
    return this.updateValue(value);
  }

  private updateValue(value: string, newBreakpoint?: string): boolean {
    this.lastParam = value;
    if (newBreakpoint) {
      this.lastBreakpoint = newBreakpoint;
    }
    this.lastResult = this.responsiveService.is(value);
    this._ref.markForCheck();
    return  this.lastResult;
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
