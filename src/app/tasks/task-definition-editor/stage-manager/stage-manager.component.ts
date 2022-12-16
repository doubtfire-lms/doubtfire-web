import { Component, Inject, Input, OnChanges } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { Stage, StageService, TaskDefinition } from 'src/app/api/models/doubtfire-model';

/**
 * The Stage Manager component will be used to build the feedback stages for a
 * given task definition.
 *
 * Input: taskDefinition - the task definition to build stages for
 * Actions: Add, edit, delete, reorder stages and their nested feedback details
 */
@Component({
  selector: 'stage-manager',
  templateUrl: 'stage-manager.component.html',
  styleUrls: ['stage-manager.component.scss'],
})
export class StageManagerComponent implements OnChanges {

  /**
   * The columns to display in the table
   */
  public columns: string[] = ['title', 'order', 'options'];

  /**
   * The form data used to collect data from the user when they are creating a new stage.
   */
  public newStageData = {
    title: undefined
  };

  /**
   * The currently selected stage. Stages are selected in the table.
   */
  public selectedStage: Stage = null;

  /**
   * Indicates if the stage is being edited.
   */
  private editingStage: boolean = false;

  /**
   * The task definition to build stages for - received as input via the task-definition-editor
   */
  @Input() taskDefinition: TaskDefinition;

  /**
   * Create the stage manager component, and link it to the stage service.
   *
   * @param stageService The stage service used to interact with the API
   */
  constructor(
    private stageService: StageService,
    @Inject(alertService) private alertService: any) {
  }

  /**
   * When data bindings change, use this to query the api for the stages for the task definition
   */
  public ngOnChanges() {
    if (!this.taskDefinition) {
      return;
    }

    // Query the stage service to get the stages for the task definition
    this.stageService.query(undefined, {
      // Pass in the task definition id as a query param
      params: {
        task_definition_id: this.taskDefinition.id
      },
      // Pass the task definition to each stage created by the service
      constructorParams: this.taskDefinition,
      // Store the stages in the task definition stages cache
      cache: this.taskDefinition.stages
    }).subscribe((stages) => {
      console.log("stages loaded into task definition")
    });
  }

  /**
   * Tests if the requested stage is curretly selected in the UI
   *
   * @param stage the stage to test
   * @returns true if the stage is currently selected
   */
  public selected(stage: Stage): boolean {
    return stage == this.selectedStage;
  }

  /**
   * Indicates if the UI is currently editing a stage
   *
   * @returns true if the UI is currently editing a stage
   */
  public get isEditing(): boolean {
    return this.editingStage;
  }

  /**
   * Tests if the requested stage is currently being edited in the UI
   *
   * @param stage the stage to test
   * @returns true if the stage is selected and we are editing
   */
  public editing(stage: Stage): boolean {
    return this.editingStage && this.selected(stage);
  }

  /**
   * Selects a stage in the UI. This will be used to determine which stage is
   * selected for the nested details, and which stage is being edited.
   *
   * @param stage the stage to select
   */
  public select(stage: Stage) {
    // You cannot change the selected shape when editing
    if (this.isEditing) {
      return;
    }

    // Toggle the selection of the shape
    if (this.selected(stage)) {
      this.selectedStage = null;
    } else {
      this.selectedStage = stage;
    }
  }

  /**
   * Start editing the stage
   *
   * @param stage the stage to edit
   */
  public edit(stage: Stage) {
    if (this.isEditing) {
      this.cancelEdit();
    }

    // Select the stage if it is not the current selected stage
    if (!this.selected(stage)) {
      this.select(stage);
    }

    // Indicate we are editing now
    this.editingStage = true;
  }

  /**
   * Delete a stage from the task definition
   *
   * @param stage the stage to delete
   */
  public delete(stage: Stage) {
    // Call delete on the API via th stage service - using the cache from the task definition.
    // The sevice will use the id from the stage to setup the url for the delete request.
    // It will them remove the stage from the cache.
    // This is call asynchronously, so we subscribe to receive the response.
    this.stageService.delete(stage, { cache: this.taskDefinition.stages }).subscribe({

      // Next is called on success
      next: () => {
        if (stage == this.selectedStage) {
          this.selectedStage = null;
        }

        this.alertService.add("success", "Stage deleted successfully", 2000);
      },

      // Error is called on failure
      error: (response) => {
        this.alertService.add("danger", `Failed to delete stage - ${response}`, 8000);
      }
    });
  }

  /**
   * Cancel editing the stage. This will revert the stage to its original state.
   */
  public cancelEdit() {
    //TODO: We should move this into entity, so that you can undo changes to any entity.
    this.selectedStage?.updateFromJson(this.selectedStage.originalJson, this.stageService.mapping);
    this.editingStage = false;
  }

  /**
   * Make a call to the API to persist the changes
   */
  public saveEdits() {
    // Use the stage service, it will read the id from the stage and use it to setup the url for the update request.
    // The changes to the title and order will go into the body of the request.
    this.stageService.update(this.selectedStage).subscribe({
      next: () => {
        this.alertService.add("success", "Stage updated successfully", 2000);
        this.editingStage = false;
      },
      error: (response) => {
        this.alertService.add("danger", `Failed to update stage - ${response}`, 8000);
      }
    });
  }

  /**
   * Add a new stage based on the data in the newStageData object
   */
  public addNewStage() {
    const stage = new Stage(this.taskDefinition);
    stage.title = this.newStageData.title;
    stage.order = this.taskDefinition.stages.size;

    // Store performs a post request with data from the stage object.
    // We pass in the cache so that the stage can be added to it
    this.stageService.store(stage, { cache: this.taskDefinition.stages }).subscribe({
      next: (newStage) => {
        // this.stages.push(newStage);
        // console.log("stage added to task definition");
        this.alertService.add("success", "Stage added successfully", 2000);
        this.newStageData.title = undefined;
        this.select(newStage);
      },
      error: (response) => {
        this.alertService.add("danger", `Failed to create stage - ${response}`, 8000);
      }
    });
  }
}
