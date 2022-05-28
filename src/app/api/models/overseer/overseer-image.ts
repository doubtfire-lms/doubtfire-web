import { Entity, EntityMapping } from 'ngx-entity-service';

export class OverseerImage extends Entity {
  id: number;
  name: string;
  tag: string;

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      overseer_image: super.toJson(mappingData, ignoreKeys)
    };
  }

  public get description(): string {
    return `${this.name} (${this.tag})`
  }
}
