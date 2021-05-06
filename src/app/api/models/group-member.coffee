angular.module("doubtfire.api.models.group-member", [])


.factory("GroupMember", (resourcePlus) ->
  resourcePlus "/units/:unit_id/group_sets/:group_set_id/groups/:group_id/members/:id", { id: "@id", group_id: "@group_id", group_set_id: "@group_set_id", unit_id: "@unit_id" }
)
