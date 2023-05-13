import { Injectable } from '@angular/core';
import { Post } from '../../interfaces/post';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private _posts: { [name: string]: Post } = {};

  constructor(
    private http: HttpClient
  ) { }

  getPost(id: string) {
    if (this._posts[id]) {
      return of(this._posts[id]);
    } else {
      return this.http.get<Post>(`${environment.api.posts}/${id}.json`)
      .pipe(
        tap((post: Post) => {
          post.published = new Date(post.published);
          post.updated = new Date(post.updated);
          return post;
        })
      );
    }
  }

  
}
