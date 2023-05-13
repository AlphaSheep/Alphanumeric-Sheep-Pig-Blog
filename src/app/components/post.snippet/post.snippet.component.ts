import { Component, Input, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Post } from 'src/app/interfaces/post';
import { PostsService } from 'src/app/services/posts/posts.service';

@Component({
  selector: 'app-post-snippet',
  templateUrl: './post.snippet.component.html',
  styleUrls: ['./post.snippet.component.less']
})
export class PostSnippetComponent {
  
  @Input() id: string = '';
  post: Post | undefined;

  constructor(
    private postService: PostsService,
    private sanitizer: DomSanitizer,
    private changes: ChangeDetectorRef,
    private view: ViewContainerRef
  ) { }

  ngOnInit() {
    this.fetchPost();
  }

  fetchPost() {
    this.postService.getPost(this.id).subscribe({
      next: (post) => {
        this.post = post;

        this.changes.detectChanges();
        this.view.element.nativeElement.querySelector('.post-content-inner').innerHTML = this.post.content;
        this.changes.detectChanges();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getTrustedContent() {
    if (this.post) {
      return this.sanitizer.bypassSecurityTrustHtml(this.post.content);
    }
    return '';
  }

  getPublishedDate() {
    if (this.post) {
      const date = new Date(this.post.published);
      let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
      let month = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
      let day = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date);
      let weekday = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date);

      return `${weekday}, ${day} ${month} ${year}`;
    }
    return '';
  }

  

}
