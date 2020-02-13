import {
  NgModule,
  ModuleWithProviders,
  InjectionToken,
  PLATFORM_ID,
  FactoryProvider,
  ClassProvider,
  ValueSansProvider,
  ValueProvider,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IsBreakpointPipe } from './is-breakpoint.pipe';
import { ResponsiveToolkitService } from './responsive-toolkit.service';

export const BREAKPOINTS = new InjectionToken('BREAKPOINTS');
export enum BOOTSTRAP_BREAKPOINTS {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}
const breakpoints: string[] = [
  BOOTSTRAP_BREAKPOINTS.XS,
  BOOTSTRAP_BREAKPOINTS.SM,
  BOOTSTRAP_BREAKPOINTS.MD,
  BOOTSTRAP_BREAKPOINTS.LG,
  BOOTSTRAP_BREAKPOINTS.XL,
];

export const breakpointProvider: ValueProvider = {
  provide: BREAKPOINTS,
  useValue: breakpoints,
};

export const WINDOW = new InjectionToken('WINDOW');

export abstract class WindowRef {
  get nativeWindow(): Window | object {
    throw new Error('Not implemented.');
  }
}
export class BrowserWindowRef extends WindowRef {
  constructor() {
    super();
  }
  get nativeWindow(): Window | object {
    return window;
  }
}
export function windowFactory(
  browserWindowRef: BrowserWindowRef,
  platformId: object
): Window | object {
  if (isPlatformBrowser(platformId)) {
    return browserWindowRef.nativeWindow;
  }
  return new Object();
}
/* Create a injectable provider for the WindowRef token that uses the BrowserWindowRef class. */
const browserWindowProvider: ClassProvider = {
  provide: WindowRef,
  useClass: BrowserWindowRef,
};

/* Create an injectable provider that uses the windowFactory function for returning the native window object. */
const windowProvider: FactoryProvider = {
  provide: WINDOW,
  useFactory: windowFactory,
  deps: [WindowRef, PLATFORM_ID],
};

/* Create an array of providers. */
export const WINDOW_PROVIDERS = [browserWindowProvider, windowProvider];
