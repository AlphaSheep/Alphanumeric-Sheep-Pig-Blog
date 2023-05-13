import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { PostSummary } from 'src/app/interfaces/post.summary';
import { Category } from 'src/app/interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class PostSummaryService {

  private postsSummary: PostSummary[] = [];
  private categoryIndex: { [name: string]: Category } = {};

  constructor(
    private http: HttpClient
  ) { 
    this.getPostsSummary().subscribe();
  }

  getPostsSummary() {
    if (this.postsSummary.length > 0) {
      return of(this.postsSummary);
    } else {
      return this.http.get<PostSummary[]>(environment.api.summary)
      .pipe(
        tap(postsSummary => {
          postsSummary.forEach(post => {post.published = new Date(post.published);})
          this.postsSummary = postsSummary;
          this.updateIndices()
          return postsSummary;
        })
      );
    }
  }

  updateIndices() {
    this.categoryIndex = {};
    this.postsSummary.forEach(post => {
      post.categories.forEach(category => {
        if (!this.categoryIndex[category]) {
          this.categoryIndex[category] = {
            name: category,
            posts: []
          };
        }
        this.categoryIndex[category].posts.push(post);
      });
    });
  }

  getIndex(category: string) {
    if (Object.keys(this.categoryIndex).length > 0) {
      return of(this.categoryIndex[category]);
    } else {
      return this.getPostsSummary()
      .pipe(
        map(() => {
          return this.categoryIndex[category];
        })
      );
    }
  }

  getCategoryNames(): Observable<Category[]> {
    if (Object.keys(this.categoryIndex).length > 0) {
      return of(Object.values(this.categoryIndex));
    } else {
      return this.getPostsSummary()
      .pipe(
        map(() => {
          return Object.values(this.categoryIndex);
        })
      );
    }
  }
}
