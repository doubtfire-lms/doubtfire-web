import {Unit, CourseMapUnit} from 'src/app/api/models/doubtfire-model';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable({
  providedIn: 'root',
}
)
export class CourseMapUnitService {

  constructor(private http: HttpClient) {}

  private baseUrl: string = `${API_URL}/coursemapunit`;

  // Get course-map-units
  getCourseMapUnitsById(id): Observable<CourseMapUnit[]> {
    const url = `${this.baseUrl}/courseMapId/${id}`;
    return this.http.get<CourseMapUnit[]>(url);
  }

  addCourseMapUnit(
    courseMapId: number,
    unitId: number,
    yearSlot: number,
    teachingPeriodSlot: number,
    unitSlot: number,
  ): Observable<Unit> {
    const url = `${this.baseUrl}`;
    const params = new HttpParams();
    params.set('courseMapId', courseMapId.toString());
    params.set('unitId', unitId.toString());
    params.set('yearSlot', yearSlot.toString());
    params.set('teachingPeriodSlot', teachingPeriodSlot.toString());
    params.set('unitSlot', unitSlot.toString());
    return this.http.post<Unit>(url, {params});
  }

  updateCourseMapUnit(
    courseMapUnitId: number,
    courseMapId: number,
    unitId: number,
    yearSlot: number,
    teachingPeriodSlow: number,
    unitSlot: number,
  ): Observable<Unit> {
    const url = `${this.baseUrl}/courseMapUnitId/${courseMapUnitId}`;
    const params = new HttpParams();
    params.set('courseMapId', courseMapId.toString());
    params.set('unitId', unitId.toString());
    params.set('yearSlot', yearSlot.toString());
    params.set('teachingPeriodSlot', teachingPeriodSlow.toString());
    params.set('unitSlot', unitSlot.toString());
    return this.http.put<Unit>(url, {params});
  }

  deleteAllCourseMapUnitsByCourseMapId(courseMapId: number): Observable<Unit> {
    const url = `${this.baseUrl}/courseMapId/${courseMapId}`;
    return this.http.delete<Unit>(url);
  }

  deleteCourseMapUnitById(courseMapUnitId: number): Observable<Unit> {
    const url = `${this.baseUrl}/courseMapUnitId/${courseMapUnitId}`;
    return this.http.delete<Unit>(url);
  }
}
