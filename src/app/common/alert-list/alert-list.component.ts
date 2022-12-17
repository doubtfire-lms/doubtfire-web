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