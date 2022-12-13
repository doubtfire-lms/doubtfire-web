// alert-list.coffee Angular code (old)
// angular.module("doubtfire.common.alert-list", [])
// .directive('alertList', ->
//   restrict: 'E'
//   templateUrl: 'common/alert-list/alert-list.tpl.html'
//   replace: true

//   controller: ($scope) ->
// )


// Convert to alert-list.component.ts Angular code (new)
import { Component, Inject } from "@angular/core";
import { alertService } from "src/app/ajs-upgraded-providers";

@Component({
    selector: "alert-list",
    templateUrl: "./alert-list.component.html",
})
export class AlertListComponent {
    constructor(@Inject(alertService) public alertService : any) {
        
    }
}
