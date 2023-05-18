import { Injectable } from '@angular/core';
import * as angular from 'angular';
import 'angular-local-storage';

// Local Storage Configuration

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
    angular.module('localStorageModule').config(['localStorageServiceProvider', function(localStorageServiceProvider){
      localStorageServiceProvider.setPrefix('doubtfire'); // set doubtfire as prefix for local storage keys
    }]);
  }
}