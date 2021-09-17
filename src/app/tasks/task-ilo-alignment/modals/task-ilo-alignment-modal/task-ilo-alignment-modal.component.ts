import {Component, OnInit} from '@angular/core'
import { projectService } from 'src/app/ajs-upgraded-providers';
import * as _ from 'lodash';

@Component({
    selector: 'taskIloAlignmentModal',
    templateUrl: './task-ilo-aligment-modal.html'
})

export class taskIloAlignmentModalComponent{
    
    source: '=';
    unit: '=';
    task: '=';
    ilo: '=';
    project: '=';
    _modalInstance: '=';
    _learningAlignments: "=";
    _alertService: '=';
    _projectService: '=';

    private alignment;
    private updateRequest;
    private data;
    private editingRationale;
    private response;
    private indexToDelete;
    private broadcast;
    private updateRating;


    constructor(modalInstance, LearningAlignments, alertService, projectService, task, ilo, alignment, unit, project, source){
        this._modalInstance = modalInstance;
        this._learningAlignments = LearningAlignments;
        this._alertService = alertService;
        this._projectService = projectService;
        this.task = task;
        this.ilo = ilo;
        this.alignment = alignment;
        this.unit = unit;
        this.project = project;
        this.source = source;
        this.editingRationale = false;
    }

    checkProject(_projectService){
        if(this.project){
            this.updateRequest = (this.data.task.id = _projectService.taskFromTaskDefId(this.project, this.data.task_definition_id).id)
        }
    }

    editRationale(){
        if(this.editingRationale){
            //updateAlignment();
        }
        this.editingRationale = !this.editingRationale
    }

    removeAlignmentItem(unit, _learningAlignments, source, alignment){
        this.data = _.extend({unit_id: unit.id});
        _learningAlignments.detete(
          this.data,
          (this.response = this.createResponse(source, alignment))
        )
    }

    createResponse(source, alignment){
      this.indexToDelete = source.task_outcome_alignments.indexOf(_.find(source.task_outcome_alignments), {id: alignment.id});
      source.task_outcome_alignments.splice.indexToDelete(1);
      alignment = undefined;
      this.broadcast('UpdateAlignmentChart', this.data, {remove: true});
    }

    updateAlignment(unit, _learningAlignments, _alertService){
      this.data = _.extend({ unit_id: unit.id}, this.alignment);
      _learningAlignments.update(this.data, 
        this.response = (_alertService.add("Success", "Task - Outcome alignment rating saved", 2000)),
        this.broadcast('UpdateAlignmentChart', this.response, {updated: true})  
      )
    }

    addAlignment(unit, ilo, task, alignment, project, _learningAlignments, source){
      this.alignment = (this.data = {
        unit_id: unit.id,
        learning_outcome_id: ilo.id,
        task_definition_id: task.definition.id,
        rating: alignment.rating,
        description: null
      })
    
      if(this.project){
        this.data.project_id = project.project_id
        this.updateRequest(this.data);
      }
      
      _learningAlignments.create(this.data,
        this.response = 
          (alignment.id = this.response.id), 
          (source.task_outcome_alignments.push(alignment)), 
          (this.broadcast('UpdateAlignmentChart', this.response, {created:true}))
        )
    }

    ngOnInit(){
      this.updateRating(this.alignment);{
        if(this.alignment != null && this.alignment != undefined){
          //this.addAlignment(this.alignment);
        }
        else{
          //this.updateAlignment(this.alignment);
        }
      }

      if(this.editRationale){
        this.updateRating(this.alignment);
      }
    }   
}