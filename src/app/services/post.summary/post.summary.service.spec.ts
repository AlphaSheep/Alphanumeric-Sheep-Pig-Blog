import { TestBed } from '@angular/core/testing';

import { PostSummaryService } from './post.summary.service';

describe('PostSummaryService', () => {
  let service: PostSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
