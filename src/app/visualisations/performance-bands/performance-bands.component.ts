import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-performance-bands',
  templateUrl: './performance-bands.component.html',
  styleUrls: ['./performance-bands.component.scss'],
})
export class PerformanceBandsComponent implements OnInit {
  bands: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('/api/performance_bands?unit_id=1').subscribe((data) => {
      this.bands = data;
    });
  }
}
