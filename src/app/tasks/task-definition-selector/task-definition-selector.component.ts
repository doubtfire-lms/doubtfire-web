import { SelectorContext } from '@angular/compiler';
import { Component, OnInit, SimpleChanges, Inject, Input, Pipe, PipeTransform } from '@angular/core';
import { any } from '@uirouter/angular';
import { groupService } from 'src/app/ajs-upgraded-providers';
 
@Component({
selector: 'taskDefinitionSelector',
templateUrl: './task-definition-selector.component.html',
styleUrls: ['./task-definition-selector.component.scss'],
})
export class TaskDefinitionSelectorComponent implements OnInit {
 
@Input() unit: any;
ngOnInit(): void { };
// Unit required
// What to do when definition is changed
 onSelectDefinition: any;
// Use ng-model to select task
 ngModel: any;
// Provide a btn-style to force the colour to change`
 buttonStyle: any;
// Clearable
 showClear: any;
 groupSetName: any;
 hideGroupSetName: any;
 selectedDefinition: any;
 setSelectedDefinition: any;
 onSelectDefinition: any;
// taskDef : any;
constructor(
@Inject(groupService) groupService: any
) {
this.buttonStyle = 'default';
this.groupSetName = function (id) {
return groupService.groupSetName(id, this.unit);
};
this.hideGroupSetName = this.unit.group_sets.length == 0;
this.selectedDefinition = null;
this.setSelectedDefinition = function (taskDef) {
this.selectedDefinition = taskDef;
this.ngModel = taskDef;
//this.taskDef = taskDef;
if (this.onSelectDefinition )//&& _.isFunction(this.onSelectDefinition))
this.onSelectDefinition(taskDef)
 
};
};
}


 
@Pipe({
name: 'groupBy'
})
export class GroupByPipe implements PipeTransform {
transform(collection: any[], property: string): any[] {
// prevents the application from breaking if the array of objects doesn't exist yet
if(!collection) {
return null;
}
const groupedCollection = collection.reduce((previous, current)=> {
if(!previous[current[property]]) {
previous[current[property]] = [current];
} else {
previous[current[property]].push(current);
}
return previous;
}, {});
// this will return an array of objects, each object containing a group of objects
return Object.keys(groupedCollection).map(key => ({ key, value: groupedCollection[key] }));
}
}
@Pipe({
name: 'orderBy',
pure: true
})
export class OrderByPipe implements PipeTransform {
transform(value: any[], propertyName: string): any[] {
if (propertyName)
return value.sort((a: any, b: any) => b[propertyName].localeCompare(a[propertyName]));
else
return value;
}
}
