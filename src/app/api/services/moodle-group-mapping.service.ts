import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MoodleGroupMapping} from 'src/app/api/models/moodle-integration';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class MoodleGroupMappingService extends CachedEntityService<MoodleGroupMapping> {
  protected readonly endpointFormat = 'moodle_group_mappings/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'moodleGroupId',
      'moodleGroupName',
      'targetType',
      'groupSetId',
      'groupId',
      'campusId',
      'tutorialStreamId',
      'tutorialId',
      'createIfMissing',
      {
        keys: 'createTutorialIfMissing',
        toEntityFn: (data: object) => {
          return (
            data['target_type'] === 'group' &&
            data['create_if_missing'] === true &&
            !data['tutorial_id'] &&
            !!data['tutorial_stream_id']
          );
        },
      },
    );

    this.mapping.mapAllKeysToJsonExcept('id', 'createTutorialIfMissing');
    this.mapping.onlyMapChanges = false;
  }

  public createInstanceFrom(): MoodleGroupMapping {
    return new MoodleGroupMapping();
  }
}
