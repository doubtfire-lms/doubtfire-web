import { Component, OnInit, Input, Inject } from '@angular/core';
import { currentUser, alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  // selector: 'campus-list',
  templateUrl: 'campus-list.component.html',
  styleUrls: ['campus-list.component.scss']
})
export class CampusListComponent implements OnInit {

  campuses = {loadedCampuses: [ { name: 'Dank Campus', mode: 'The Dank Mode' }, { name: 'Meme Campus', mode: 'Memes for Dreams' }, ]};

  ngOnInit(): void {
    console.log('here');
  }

  constructor(
    @Inject(currentUser) private currentUser: any,
    @Inject(alertService) private alertService: any
  ) { }


}
