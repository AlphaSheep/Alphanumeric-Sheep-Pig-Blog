import { Component } from '@angular/core';
import { PostSummary } from 'src/app/interfaces/post.summary';
import { PostSummaryService } from 'src/app/services/post.summary/post.summary.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.less']
})
export class SummaryComponent {

  _posts: PostSummary[] = [];

  constructor(
    private postSummaryService: PostSummaryService
  ) { }

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts() {
    this.postSummaryService.getPostsSummary().subscribe({
      next: (posts) => {
        this._posts = posts;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getPosts(): PostSummary[] {
    return this._posts;
  }

}
