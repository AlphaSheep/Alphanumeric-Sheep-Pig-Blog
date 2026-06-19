import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PostSummaryService } from 'app/services/post.summary/post.summary.service';
import { Category } from 'app/interfaces/category';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HeaderComponent {
  categories: Category[] = [];

  constructor() {}
}
