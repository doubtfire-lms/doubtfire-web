import { Component } from '@angular/core';

@Component({
  selector: 'local-storage',
  template: ''
})
export class LocalStorageComponent {
  constructor() {

    localStorage.setItem('prefix', 'doubtfire');// Set the prefix for local storage

  }
}
