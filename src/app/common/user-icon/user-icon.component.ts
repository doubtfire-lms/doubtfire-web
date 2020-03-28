import { Component, Input, OnInit, Inject } from '@angular/core';
import { User } from 'src/app/api/models/user/user';
import { currentUser } from 'src/app/ajs-upgraded-providers';

import * as md5 from 'md5';

@Component({
  selector: 'user-icon',
  templateUrl: './user-icon.component.html',
  styleUrls: ['./user-icon.component.scss']
})

export class UserIcon implements OnInit {
  @Input() user: User;
  @Input() size: number;
  @Input() email: string;

  constructor(
    @Inject(currentUser) private currentUser: any,
  ) { }

  ngOnInit() {
    this.user = this.currentUser.profile;
    this.size = 100;
    this.email = this.user.email;
  }

  userBackgroundStyle(email) {
    // Gravatar hash
    let hash = if (email) then md5.createHash(email.trim().toLowerCase()) else md5.createHash('')
    backgroundUrl = "https://www.gravatar.com/avatar/#{hash}.png?default=blank&size=#{this.size}"
    "background-image: url('#{backgroundUrl}')"
  }

    this.initials = (->
  initials = if (this.user && this.user.name) then this.user.name.split(" ") else "  "
if initials.length > 1 then("#{initials[0][0]}#{initials[1][0]}").toUpperCase() else "  "
    ) ()
}


// angular.module('doubtfire.common.user-icon', [])
// .directive('userIcon', ->
//   restrict: 'E'
//   replace: true
//   scope:
//     user: '=?'
//     size: '=?'
//     email: '=?'
//   templateUrl: 'common/user-icon/user-icon.tpl.html'
//   controller: (this, $http, currentUser, md5) ->
//     $scope.user ?= currentUser.profile
//     $scope.size ?= 100
//     $scope.email ?= $scope.user.email

//     $scope.userBackgroundStyle = (email) ->
//       # Gravatar hash
//       hash = if (email) then md5.createHash(email.trim().toLowerCase()) else md5.createHash('')
//       backgroundUrl = "https://www.gravatar.com/avatar/#{hash}.png?default=blank&size=#{$scope.size}"
//       "background-image: url('#{backgroundUrl}')"

//     $scope.initials = (->
//       initials = if ($scope.user && $scope.user.name) then $scope.user.name.split(" ") else "  "
//       if initials.length > 1 then ("#{initials[0][0]}#{initials[1][0]}").toUpperCase() else "  "
//     )()
// )
