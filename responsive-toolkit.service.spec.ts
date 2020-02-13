import { TestBed } from '@angular/core/testing';

import { ResponsiveToolkitService } from './responsive-toolkit.service';

describe('ResponsiveToolkitService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResponsiveToolkitService = TestBed.get(ResponsiveToolkitService);
    expect(service).toBeTruthy();
  });
});
