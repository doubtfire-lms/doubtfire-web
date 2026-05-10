// Use this module to define utility filters and directives
// that are used throughout Doubtfire

import * as angular from 'angular';
import moment from 'moment';
import * as _ from 'lodash';

export const utilService = angular.module('utilService', [])

  // Returns a human-readable "time ago" string from a date
  .filter('fromNow', () => {
    return (date: string) => {
      return moment(new Date(date)).fromNow();
    };
  })

  // Converts text to title case
  .filter('titleize', () => {
    return (input: string) => {
      return _.startCase(_.toLower(input));
    };
  })

  // Converts text to a human-readable format
  .filter('humanize', () => {
    return (input: string) => {
      return _.startCase(input);
    };
  })

  // A directive to ensure browser form auto-fill works,
  // since Angular doesn't support it.
  // See: http://stackoverflow.com/a/14966711
  .directive('autoFillSync', ($timeout: angular.ITimeoutService) => {
    return {
      require: 'ngModel',
      link: (scope: angular.IScope, elem: any, attrs: any, ngModel: any) => {
        const origVal = elem.val();
        $timeout(() => {
          const newVal = elem.val();
          if (ngModel.$pristine && origVal !== newVal) {
            ngModel.$setViewValue(newVal);
          }
        }, 500);
      },
    };
  });
