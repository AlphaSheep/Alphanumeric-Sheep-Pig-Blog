import { Component } from '@angular/core';
import { PostSummaryService } from 'src/app/services/post.summary/post.summary.service';
import { Category } from 'src/app/interfaces/category';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {

  categories: Category[] = [];

  constructor(
  ) { }

}
