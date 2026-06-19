import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AboutComponent {}
