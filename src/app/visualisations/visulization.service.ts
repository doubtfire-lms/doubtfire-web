import { Injectable } from '@angular/core';
import * as angular from 'angular';
import * as _ from 'lodash';
import { analyticsService } from '../ajs-upgraded-providers';

 @Injectable()
export class VisulizationService {

    dirtyOpts: any
    dirtyConf: any;

  constructor() {}
  show (type: any, visualisationName: any, opts: any, conf: any, titleOpts: any, subtitleOpts: any)
  {
    let DEFAULT_OPTS =
    {
      objectequality: true,
      interactive: true,
      //tooltips: yes
      showValues: true,
      showXAxis: true,
      showYAxis: true,
      showLegend: true,
      transitionDuration: 500,
      duration: 500,
      height: 600,
      color: [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf"
      ]
    }

    let DEFAULT_CONF = {
      visible: true, //default: true
      extended: false, // default: false
      disabled: false, // default: false
      autorefresh: true, // default: true
      refreshDataOnly: true, // default: true
      deepWatchOptions: true, // default: true
      deepWatchData: false, // default: false
      deepWatchConfig: true, // default: true
      debounce: 10 // default: 10
    }

    this.dirtyOpts = _.extend (DEFAULT_OPTS, opts)
     this.dirtyOpts.type = type 
    this.dirtyConf = _.extend (DEFAULT_CONF, conf)

    //Google tracking
    //analyticsService.event (Visualisations', 'Created Visualisation', visualisationName)

    return [ { chart: this.dirtyOpts, title: titleOpts, subtitle: subtitleOpts },  this.dirtyConf ]
}
refreshAll ()
{
    //$interval (-> window.dispatchEvent(new Event('resize'))), 50, 1
}    

}
