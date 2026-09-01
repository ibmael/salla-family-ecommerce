import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-announcement-bar',
  templateUrl: './announcement-bar.component.html',
  styleUrl: './announcement-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementBarComponent {}
