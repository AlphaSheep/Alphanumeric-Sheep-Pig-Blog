import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PostComponent } from './pages/post/post.component';
import { SummaryComponent } from './pages/summary/summary.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CategoryComponent } from './pages/category/category.component';
import { PostSnippetComponent } from './components/post.snippet/post.snippet.component';
import { AboutComponent } from './pages/about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    PostComponent,
    SummaryComponent,
    HeaderComponent,
    FooterComponent,
    CategoryComponent,
    PostSnippetComponent,
    AboutComponent,
  ],
  bootstrap: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
