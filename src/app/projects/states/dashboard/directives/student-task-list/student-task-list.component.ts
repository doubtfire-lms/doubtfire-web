import { Component, Input, OnInit } from '@angular/core';
import { GradeService } from 'src/app/common/services/grade.service';

@Component({
  selector: 'student-task-list',
  templateUrl: './student-task-list.component.html',
  styleUrls: ['./student-task-list.component.scss'],
})
export class StudentTaskListComponent implements OnInit {
  @Input() project: any;
  @Input() taskData: any;
  @Input() refreshTasks: any;

  filteredTasks: any[] = [];
  filters: any = {
    taskName: null
  };
  showCreatePortfolio: boolean = false;
  gradeNames: any;

  constructor(private gradeService: GradeService) {
    // Expose grade service names
    this.gradeNames = this.gradeService.grades;
  }

  ngOnInit() {
    // Check taskData exists but don't throw error - handle gracefully
    if (!this.taskData) {
      console.warn('StudentTaskList - taskData not provided, creating default');
      this.taskData = {
        selectedTask: null,
        selectedTaskAbbr: null,
        onSelectedTaskChange: null
      };
    }
    
    // Sort the tasks according to priority
    if (this.project) {
      this.project.calcTopTasks();
    }
    
    // Apply filters first-time
    this.applyFilters();
    
    // Set refreshTasks function
    this.refreshTasks = this.applyFilters;
    
    // Scroll to selected task after timeout
    setTimeout(() => {
      if (this.taskData?.selectedTask) {
        this.scrollToTaskInList(this.taskData.selectedTask);
      }
    });
  }

  applyFilters() {
    if (this.project && this.project.activeTasks) {
      const allTasks = this.project.activeTasks();
      
      // Use the tasksWithName filter (equivalent to AngularJS filter)
      let filteredTasks = this.filterTasksByName(allTasks, this.filters.taskName);
      
      // Sort by topWeight (equivalent to orderBy: 'topWeight')
      filteredTasks.sort((a, b) => (b.topWeight || 0) - (a.topWeight || 0));
      
      this.filteredTasks = filteredTasks;
      this.showCreatePortfolio = !this.filters.taskName || 
        'create portfolio'.indexOf(this.filters.taskName.toLowerCase()) >= 0;
    } else {
      this.filteredTasks = [];
      this.showCreatePortfolio = !this.filters.taskName || 
        'create portfolio'.indexOf(this.filters.taskName.toLowerCase()) >= 0;
    }
  }

  filterTasksByName(tasks: any[], taskName: string): any[] {
    if (!taskName || taskName.trim() === '') {
      return tasks;
    }
    
    const searchTerm = taskName.toLowerCase();
    return tasks.filter(task => 
      task.definition.name.toLowerCase().includes(searchTerm) ||
      task.definition.abbreviation.toLowerCase().includes(searchTerm)
    );
  }

  taskNameChanged() {
    this.applyFilters();
  }

  setSelectedTask(task: any) {
    // Clicking on already selected task will disable that selection
    if (this.isSelectedTask(task)) {
      task = null;
    }
    this.taskData.selectedTask = task;
    if (this.taskData.onSelectedTaskChange) {
      this.taskData.onSelectedTaskChange(task);
    }
    if (task) {
      this.scrollToTaskInList(task);
    }
  }

  scrollToTaskInList(task: any) {
    const taskEl = document.querySelector("#" + task.taskKeyToIdString()) as any;
    if (!taskEl) return;
    
    const funcName = taskEl.scrollIntoViewIfNeeded ? 'scrollIntoViewIfNeeded' : 
                     taskEl.scrollIntoView ? 'scrollIntoView' : null;
    
    if (funcName) {
      taskEl[funcName]({behavior: 'smooth'});
    }
  }

  isSelectedTask(task: any): boolean {
    // Compare by definition
    return task && this.taskData?.selectedTask &&
      task.definition.id === this.taskData.selectedTask.definition.id;
  }

  nearEnd(): boolean {
    if (!this.project || !this.project.unit) return false;
    const lateDate = new Date(this.project.unit.endDate); // Get end date as date
    lateDate.setDate(lateDate.getDate() - 21); // subtract 21 days
    return new Date() > lateDate;
  }

  trackByTaskId(index: number, task: any): any {
    return task.id || task.definition.abbreviation;
  }
}
