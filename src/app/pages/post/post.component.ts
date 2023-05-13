import { Component, Input, ChangeDetectorRef, ViewChildren, ViewContainerRef, ElementRef } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { Post } from 'src/app/interfaces/post';
import { PostsService } from 'src/app/services/posts/posts.service';
import katex from 'katex';
import '../../lib/modernizr.js';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.less']
})
export class PostComponent {

  _id: string = '';
  @Input() set id(value: string) {
    this._id = value.replace(/\.html$/, '');
  }

  @ViewChildren('gist', { read: ViewContainerRef }) gistElements: any;

  post: Post | undefined;

  constructor(
    private postService: PostsService,
    private sanitizer: DomSanitizer,
    private changes: ChangeDetectorRef,
    private view: ViewContainerRef,
    private titleService: Title,
  ) { }

  ngOnInit(): void {
    this.fetchPost();
  }

  fetchPost() {
    this.postService.getPost(this._id).subscribe({
      next: (post) => {
        this.titleService.setTitle(`${post.title} | Alphanumeric Sheep Pig`);

        this.post = post;

        this.changes.detectChanges();
        // This is a once-off, we don't want the innerHTML to bind
        this.view.element.nativeElement.querySelector('.post-content').innerHTML = this.post.content;
        this.changes.detectChanges();

        fixGists(this.view.element);
        fixLatex(this.view.element);


        // this.changes.detectChanges();

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

  getPublishedTime() {
    if (this.post) {
      const date = new Date(this.post.published);
      let hour = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', hourCycle: 'h12' }).format(date);

      return `${hour}`.toUpperCase();
    }
    return '';
  }
}


function fixGists(element: ElementRef) {
  let gistContainers = element.nativeElement.querySelectorAll('app-gist-container');
  for (let i=0; i < gistContainers.length; i++) {
    const container = gistContainers[i];

    const src = container.getAttribute('src');
    const id = "iframe-" + container.getAttribute('id');

    const iframe = document.createElement('iframe');
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('id', id);
    iframe.setAttribute('type', 'text/javascript');
    const content = `
      <html>
        <head>
          <base target="_parent">
        </head>
        <body onload="parent.document.getElementById('${id}')">
          <script type="text/javascript" src="${src}"></script>
          <link rel="stylesheet" href="${window.location.origin}/styles.css">
        </body>
      </html>
    `;
    container.appendChild(iframe);
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(content);
    iframe.contentDocument?.close();

    setInterval(() => {
      if (iframe.contentWindow?.document.body) { // Wait for body ready
        let height = iframe.contentWindow.document.body.scrollHeight;
        iframe.style.height = height + 'px';
      }
    }, 100);
  }
}

function fixLatex(element: ElementRef) {
  let latexContainers = element.nativeElement.querySelectorAll('app-latex');
  for (let i=0; i < latexContainers.length; i++) {
    const container = latexContainers[i];
    let content = container.innerHTML;

    const displayMode = container.getAttribute('displayMode') === 'true';
    const html = katex.render(content, container, {
      displayMode: displayMode,
      throwOnError: false
    });
  }
}
