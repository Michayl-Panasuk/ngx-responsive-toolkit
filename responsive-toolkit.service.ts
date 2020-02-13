import { Injectable, Inject, Renderer2, PLATFORM_ID } from '@angular/core';
import { WINDOW, BREAKPOINTS } from './window.provider';
import { isPlatformBrowser } from '@angular/common';
import { Subject, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export enum COMPARE_OPERATORS {
  EQUAL = '=',
  GREATER = '>',
  GREATER_OR_EQUAL = '>=',
  SMALLER = '<',
  SMALLER_OR_EQUAL = '<=',
}

export const CUSTOM_EVENT = 'responsiveToolkitResize';
export const UNKNOWN_BREAKPOINT = 'UNKNOWN_BREAKPOINT';

@Injectable()
export class ResponsiveToolkitService {
  interval = 300;
  framework = null;
  private target: HTMLElement;
  private currentBreakpointSubject$: BehaviorSubject<string> = new BehaviorSubject(null);
  public currentBreakpoint$ = this.currentBreakpointSubject$.pipe(distinctUntilChanged());
  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(BREAKPOINTS) private breakpoints: string[],
    @Inject(PLATFORM_ID) private platformId
  ) {

    if (isPlatformBrowser(platformId)) {
      this.throttle('resize', CUSTOM_EVENT, window);
      this.target = window.document.querySelector('body');
      window.addEventListener(CUSTOM_EVENT, this.handleResize.bind(this));
    }
  }

  get currentBreakpoint() {
    return this.currentBreakpointSubject$.getValue();
  }

  /**
   * Returns true if current breakpoint matches passed alias
   */
  is(str: string) {
    if (this.isAnExpression(str)) {
      return this.isMatchingExpression(str);
    }
    return this.getCurrentBreakpoint().includes(str);
    // return this.breakpoints[str] && this.breakpoints[str].is(':visible');
  }

  /**
   * Determines which framework-specific breakpoint detection divs to use
   */
  // use( frameworkName, breakpoints ) {
  //     this.framework = frameworkName.toLowerCase();

  //     if( this.framework === 'bootstrap' || this.framework === 'foundation') {
  //         this.breakpoints = this.detectionDivs[ this.framework ];
  //     } else {
  //         this.breakpoints = breakpoints;
  //     }

  //     this.applyDetectionDivs();
  // }

  /**
   * Returns current breakpoint alias
   */
  current() {
    let name = UNKNOWN_BREAKPOINT;
    this.breakpoints.some(alias => {
      if (this.is(alias)) {
        name = alias;
        return true;
      }
    });
    return name;
  }

  /*
   * Waits specified number of miliseconds before executing a callback
   */
  changed(fn, ms: number) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn();
      }, ms || this.interval);
    };
  }

  private handleResize() {
    this.currentBreakpointSubject$.next(this.getCurrentBreakpoint());
  }

  private getCurrentBreakpoint() {
    if (isPlatformBrowser(this.platformId)) {
      return this.window
      .getComputedStyle(this.target, ':before')
      .getPropertyValue('content');
    } else {
      return '';
    }

  }

  /**
   * Determines whether passed string is a parsable expression
   */
  private isAnExpression(str: string) {
    return (
      str.charAt(0) === COMPARE_OPERATORS.SMALLER ||
      str.charAt(0) === COMPARE_OPERATORS.SMALLER
    );
  }

  /**
   * Splits the expression in into <|> [=] alias
   */
  private splitExpression(str: string) {
    // Used operator
    const operator = str.charAt(0);
    // Include breakpoint equal to alias?
    const orEqual = str.charAt(1) === COMPARE_OPERATORS.EQUAL ? true : false;

    /**
     * Index at which breakpoint name starts.
     *
     * For:  >sm, index = 1
     * For: >=sm, index = 2
     */
    const index = 1 + (orEqual ? 1 : 0);

    /**
     * The remaining part of the expression, after the operator, will be treated as the
     * breakpoint name to compare with
     */
    const breakpointName = str.slice(index);

    return {
      operator,
      orEqual,
      breakpointName,
    };
  }

  /**
   * Returns true if currently active breakpoint matches the expression
   */
  private isAnyActive(breakpoints: string[]) {
    const current = this.getCurrentBreakpoint();
    return breakpoints.some(breakpoint => {
      // Once first breakpoint matches, return true and break out of the loop
      if (current.includes(breakpoint)) {
        return true;
      }
    });
  }

  /**
   * Determines whether current breakpoint matches the expression given
   */
  private isMatchingExpression(str: string) {
    const expression = this.splitExpression(str);

    // Get names of all breakpoints
    const breakpointList = this.breakpoints;

    // Get index of sought breakpoint in the list
    let pos = breakpointList.indexOf(expression.breakpointName);

    // Breakpoint found
    if (pos !== -1) {
      let start = 0;
      let end = 0;

      /**
       * Parsing viewport.is('<=md') we interate from smallest breakpoint ('xs') and end
       * at 'md' breakpoint, indicated in the expression,
       * That makes: start = 0, end = 2 (index of 'md' breakpoint)
       *
       * Parsing viewport.is('<md') we start at index 'xs' breakpoint, and end at
       * 'sm' breakpoint, one before 'md'.
       * Which makes: start = 0, end = 1
       */
      if (expression.operator === COMPARE_OPERATORS.SMALLER) {
        start = 0;
        end = expression.orEqual ? ++pos : pos;
      }
      /**
       * Parsing viewport.is('>=sm') we interate from breakpoint 'sm' and end at the end
       * of breakpoint list.
       * That makes: start = 1, end = undefined
       *
       * Parsing viewport.is('>sm') we start at breakpoint 'md' and end at the end of
       * breakpoint list.
       * Which makes: start = 2, end = undefined
       */
      if (expression.operator === COMPARE_OPERATORS.GREATER) {
        start = expression.orEqual ? pos : ++pos;
        end = undefined;
      }

      const acceptedBreakpoints = breakpointList.slice(start, end);

      return this.isAnyActive(acceptedBreakpoints);
    }
  }

  private throttle(type, name, window) {
    const obj  = window;
    let running = false;
    const func = function() {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  }
}
