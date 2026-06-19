import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PostSummary } from 'app/interfaces/post.summary';
import { PostSummaryService } from 'app/services/post.summary/post.summary.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SummaryComponent {
  _posts: PostSummary[] = [];

  constructor(private postSummaryService: PostSummaryService) {}

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts() {
    this.postSummaryService.getPostsSummary().subscribe({
      next: (posts: PostSummary[]) => {
        this._posts = posts;
      },
      error: (error: Error) => {
        console.log(error);
      },
    });
  }

  getPosts(): PostSummary[] {
    return this._posts;
  }
}
