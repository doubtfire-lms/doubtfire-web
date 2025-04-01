import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    const url = `${API_URL}/course/`;
    console.log("fetched courses");
    return this.http.get<Course[]>(url);
  }

  getCourseById(id: string): Observable<Course> {
    return this.http.get<Course>(`${API_URL}/course/${id}`);
  }

  createCourse(course: Course): Observable<Course> {
    const url = `${API_URL}/course/`;

    return this.http.post<Course>(url, course);
  }

  updateCourse(id: string, course: Course): Observable<Course> {
    return this.http.put<Course>(`${API_URL}/course/${id}`, course);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/course/${id}`);
  }
}
