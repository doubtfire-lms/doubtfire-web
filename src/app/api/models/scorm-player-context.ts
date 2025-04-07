import {User} from 'src/app/api/models/doubtfire-model';

type DataModelState = 'Uninitialized' | 'Initialized' | 'Terminated';

type DataModelError = Record<number, string>;
const CMIErrorCodes: DataModelError = {
  0: 'No Error',
  101: 'General Exception',
  102: 'General Initialization Failure',
  103: 'Already Initialized',
  104: 'Content Instance Terminated',
  111: 'General Termination Failure',
  112: 'Termination Before Initialization',
  113: 'Termination After Termination',
  122: 'Retrieve Data Before Initialization',
  123: 'Retrieve Data After Termination',
  132: 'Store Data Before Initialization',
  133: 'Store Data After Termination',
  142: 'Commit Before Initialization',
  143: 'Commit After Termination',
  201: 'General Argument Error',
  301: 'General Get Failure',
  351: 'General Set Failure',
  391: 'General Commit Failure',
  401: 'Undefined Data Model Element',
  402: 'Unimplemented Data Model Element',
  403: 'Data Model Element Value Not Initialized',
  404: 'Data Model Element Is Read Only',
  405: 'Data Model Element Is Write Only',
  406: 'Data Model Element Type Mismatch',
  407: 'Data Model Element Value Out Of Range',
  408: 'Data Model Dependency Not Established',
};

export class ScormPlayerContext {
  mode: 'browse' | 'normal' | 'review' | 'preview';
  state: DataModelState;

  private _errorCode: number;
  get errorCode() {
    return this._errorCode;
  }
  set errorCode(value: number) {
    this._errorCode = value;
  }

  getErrorMessage(value: string): string {
    return CMIErrorCodes[value];
  }

  projectId: number;
  taskDefId: number;
  user: User;

  attemptId: number;
  learnerName: string;
  learnerId: number;

  constructor(user: User) {
    this.user = user;
    this.learnerId = user.id;
    this.learnerName = user.firstName + ' ' + user.lastName;
    this.state = 'Uninitialized';
    this.errorCode = 0;
  }
}
