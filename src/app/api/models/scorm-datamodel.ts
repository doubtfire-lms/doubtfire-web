export class ScormDataModel {
  dataModel: Record<string, string | number> = {};
  readonly msgPrefix = 'SCORM DataModel: ';

  constructor() {
    this.dataModel = {};
  }

  public restore(dataModel: string) {
    // console.log(this.msgPrefix + 'restoring DataModel with provided data');
    this.dataModel = JSON.parse(dataModel) as Record<string, string | number>;
  }

  public get(key: string): string {
    // console.log(`SCORM DataModel: get ${key} ${this.dataModel[key]}`);
    return String(this.dataModel[key] ?? '');
  }

  public dump(): Record<string, string | number> {
    return this.dataModel;
  }

  public set(key: string, value: string): string {
    // console.log(this.msgPrefix + 'set: ', key, value);
    this.dataModel[key] = value;
    if (key.match('cmi.interactions.\\d+.id')) {
      // cmi.interactions._count must be incremented after a new interaction is created
      const interactionPath = key.match('cmi.interactions.\\d+');
      const objectivesCounterForInteraction = interactionPath.toString() + '.objectives._count';
      // console.log('Incrementing cmi.interactions._count');
      this.dataModel['cmi.interactions._count'] =
        Number(this.dataModel['cmi.interactions._count'] ?? 0) + 1;
      // cmi.interactions.n.objectives._count must be initialized after an interaction is created
      // console.log(`Initializing ${objectivesCounterForInteraction}`);
      this.dataModel[objectivesCounterForInteraction] = 0;
    }
    if (key.match('cmi.interactions.\\d+.objectives.\\d+.id')) {
      const interactionPath = key.match('cmi.interactions.\\d+.objectives');
      const objectivesCounterForInteraction = interactionPath.toString() + '._count';
      // cmi.interactions.n.objectives._count must be incremented after objective creation
      // console.log(`Incrementing ${objectivesCounterForInteraction}`);
      this.dataModel[objectivesCounterForInteraction.toString()] =
        Number(this.dataModel[objectivesCounterForInteraction.toString()] ?? 0) + 1;
    }
    if (key.match('cmi.objectives.\\d+.id')) {
      // cmi.objectives._count must be incremented after a new objective is created
      // console.log('Incrementing cmi.objectives._count');
      this.dataModel['cmi.objectives._count'] =
        Number(this.dataModel['cmi.objectives._count'] ?? 0) + 1;
    }
    return 'true';
  }
}
