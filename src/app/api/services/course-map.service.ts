import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseMap } from '../models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable({
  providedIn: 'root'
})
export class CourseMapService {

  private baseUrl: string = `${API_URL}/coursemap`;
  constructor(private http: HttpClient) {}

  // Get course map by user ID
  getCourseMapByUserId(userId: number): Observable<CourseMap> {
    const url = `${this.baseUrl}/userId/${userId}`;
    return this.http.get<CourseMap>(url);
  }

  // Get course map by course ID
  getCourseMapByCourseId(courseId: number): Observable<CourseMap[]> {
    const url = `${this.baseUrl}/courseId/${courseId}`;
    return this.http.get<CourseMap[]>(url);
  }

  // Add a new course map
  addCourseMap(userId: number, courseId: number): Observable<CourseMap> {
    const url = `${this.baseUrl}`;
    return this.http.post<CourseMap>(url, { userId, courseId });
  }

  // Update an existing course map by its ID
  updateCourseMap(courseMapId: number, userId: number, courseId: number): Observable<CourseMap> {
    const url = `${this.baseUrl}/courseMapId/${courseMapId}`;
    return this.http.put<CourseMap>(url, { userId, courseId });
  }

  // Delete a course map by its ID
  deleteCourseMapById(courseMapId: number): Observable<void> {
    const url = `${this.baseUrl}/courseMapId/${courseMapId}`;
    return this.http.delete<void>(url);
  }

  // Delete all course maps by user ID
  deleteCourseMapsByUserId(userId: number): Observable<void> {
    const url = `${this.baseUrl}/userId/${userId}`;
    return this.http.delete<void>(url);
  }
}
