import { Component, Input, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PostSummary } from 'src/app/interfaces/post.summary';
import { PostSummaryService } from 'src/app/services/post.summary/post.summary.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.less']
})
export class CategoryComponent {

  @Input() id: string = '';
  posts: any[] = [];

  constructor(
    private postSummaryService: PostSummaryService,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    this.fetchPosts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && !changes['id'].firstChange) {
      this.fetchPosts();
    }
  }

  fetchPosts(): void {
    this.titleService.setTitle(`${this.id} | Alphanumeric Sheep Pig`);
    this.postSummaryService.getIndex(this.id)
    .subscribe((category) => {
      this.posts = category.posts.sort((a: PostSummary, b: PostSummary) => {
        return b.published.getTime() - a.published.getTime();
      });
    });
  }
}
