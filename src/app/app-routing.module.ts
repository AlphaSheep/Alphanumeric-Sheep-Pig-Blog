import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlMatcher, UrlSegment } from '@angular/router';
import { SummaryComponent } from './pages/summary/summary.component';
import { PostComponent } from './pages/post/post.component';
import { CategoryComponent } from './pages/category/category.component';
import { AboutComponent } from './pages/about/about.component';

const legacyUrlMatcher: UrlMatcher = (segments) => {
  if (segments.length === 3 && segments[0].path.match(/\d{4}/) && segments[1].path.match(/\d{2}/) && segments[2].path.match(/.*\.html$/)) {
    return {
      consumed: segments,
      posParams: {
        id: new UrlSegment(segments[2].path.replace(/\.html$/, ''), {})
      }
    };
  }
  return null;
};

const routes: Routes = [
  { path: '', component: SummaryComponent },
  { path: 'post/:id', component: PostComponent },
  { path: 'category/:id', component: CategoryComponent },
  { path: 'about', component: AboutComponent },
  { matcher: legacyUrlMatcher, redirectTo: 'post/:id' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
