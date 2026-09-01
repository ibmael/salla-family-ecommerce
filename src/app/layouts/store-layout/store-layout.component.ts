import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnnouncementBarComponent } from '../../shared/components/announcement-bar/announcement-bar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-store-layout',
  imports: [RouterOutlet, AnnouncementBarComponent, HeaderComponent, FooterComponent],
  templateUrl: './store-layout.component.html',
  styleUrl: './store-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreLayoutComponent {}
