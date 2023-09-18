@Injectable()
export class UnitRoleService extends CachedEntityService<UnitRole> {
  protected readonly endpointFormat = 'unit_roles/:id:';
  
  constructor(
    httpClient: HttpClient,
    private userService: UserService,
    private unitService: UnitService,
    private teachingPeriodService: TeachingPeriodService,
    @Inject(analyticsService) private AnalyticsService: any
  ) {
    super(httpClient, API_URL);
    
    this.initializeMapping();
  }

  private initializeMapping(): void {
    this.addIdMapping();
    this.addUnitMapping();
    this.addUserMapping();
    this.addRoleMapping();
    this.addRoleIdMapping();
    this.addUserIdMapping();
    this.addUnitIdMapping();

    this.mapping.addJsonKey('roleId', 'userId', 'unitId', 'role');
  }

  private addIdMapping(): void {
    this.mapping.addKey('id');
  }

  private addUnitMapping(): void {
    const toEntityFn = (data, key, entity) => {
      const unitData = data['unit'];
      return this.unitService.cache.getOrCreate(unitData.id, unitService, unitData);
    };
    
    const toJsonFn = (entity) => entity.unit?.id;

    this.mapping.addKey({ keys: 'unit', toEntityFn, toJsonFn });
  }

  // Add similar methods for user, role, roleId, userId and unitId mappings

  public createInstanceFrom(json: any): UnitRole {
    return new UnitRole();
  }
}