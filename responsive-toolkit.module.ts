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
import { WINDOW, windowFactory, WINDOW_PROVIDERS, breakpointProvider } from './window.provider';



@NgModule({
  declarations: [IsBreakpointPipe],
  exports: [IsBreakpointPipe],
  imports: [CommonModule],
})
export class ResponsiveToolkitModule {
  static forRoot(config?): ModuleWithProviders {
    return {
      ngModule: ResponsiveToolkitModule,
      providers: [
        ResponsiveToolkitService,
       ...WINDOW_PROVIDERS,
       breakpointProvider,
      ],
    };
  }
}
