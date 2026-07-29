import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppInjector } from 'src/app/app-injector';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

interface Notification {
  id: number;
  message: string;
}

@Component({
  selector: 'f-notifications-button',
  templateUrl: './notifications-button.component.html',
  styleUrls: ['./notifications-button.component.css']
})
export class NotificationsButtonComponent implements OnInit {
  showNotifications = false;
  notifications: Notification[] = [];
  private readonly API_URL = AppInjector.get(DoubtfireConstants).API_URL;

  constructor(private http: HttpClient, private eRef: ElementRef) {}

  ngOnInit() {
    this.loadNotifications();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  loadNotifications() {
    this.http.get<Notification[]>(`${this.API_URL}/notifications`).subscribe({
      next: data => this.notifications = data,
      error: err => console.error('Error loading notifications', err)
    });
  }

  dismissNotification(notificationId: number) {
    this.http.delete(`${this.API_URL}/notifications/${notificationId}`).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(note => note.id !== notificationId);
      },
      error: err => console.error('Error deleting notification', err)
    });
  }

  deleteAllNotifications() {
    this.http.delete(`${this.API_URL}/notifications`).subscribe({
      next: () => {
        this.notifications = [];
      },
      error: err => console.error('Error deleting all notifications', err)
    });
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.showNotifications && !this.eRef.nativeElement.contains(event.target)) {
      this.showNotifications = false;
    }
  }
}
