import {NgHybridStateDeclaration} from '@uirouter/angular-hybrid';
import {IndexComponent} from './index.component';

/**
 * STRICT Angular replacement for:
 * src/app/units/states/index/index.coffee
 */
export const unitsIndexState: NgHybridStateDeclaration = {
  name: 'units/index',
  url: '/units/:unitId',
  abstract: true,
  views: {
    main: {
      component: IndexComponent,
    },
  },
  data: {
    pageTitle: '_Home_',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};
