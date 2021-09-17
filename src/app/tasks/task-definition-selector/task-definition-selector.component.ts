import {
    Component,
    OnInit,
  } from '@angular/core';
import * as _ from 'lodash';


  @Component({
    selector: 'taskDefinitionSelector',
    templateUrl: './task-definition-selector.html',
    styleUrls: ['./task-definition-selector.scss'],
  })
  export class taskDefinitionSelectorComponent {
    /// Unit required
    unit: string = "=";
    ///What to do when definition is changed
    onSelectionDefinition: "=";
    ///Use ng-model to select task
    ngModel: "=?";
    ///What to do when definition is changed
    buttonStyle: "@";
    ///Clearable
    showClear: "=?";
    private group;
    private selectedDefinition;

    constructor(groupService){
      this.group = groupService;
    }

    setName(id, unit){
      this.group.groupSetName(id, unit)
    }

    hideName(id, unit){

    }
    
    setDefinition(taskDef, selectedDefinition, ngModel, onSelectionDefinition){
      selectedDefinition = taskDef;
      ngModel = taskDef;
      if (onSelectionDefinition && _.isFunction(onSelectionDefinition)){
        onSelectionDefinition(taskDef)
      }
    }
  }