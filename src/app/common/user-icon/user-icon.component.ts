import { Component, Input, OnInit, Inject } from '@angular/core';
import { User } from 'src/app/api/models/user/user';
import { currentUser } from 'src/app/ajs-upgraded-providers';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'user-icon',
  templateUrl: './user-icon.component.html',
  styleUrls: ['./user-icon.component.scss']
})

export class UserIconComponent implements OnInit {
  @Input() user: User = this.currentUser.profile;
  @Input() size: number = 100;
  @Input() email: string = this.user.email;

  constructor(
    @Inject(currentUser) private currentUser: any,
  ) {

  }

  ngOnInit(): void {
  }

  get backgroundUrl(): string {
    let hash = this.email != null ? Md5.hashStr(this.email.trim().toLowerCase()) : Md5.hashStr('');
    // let hash =  Md5.hashStr('jake.renzella@deakin.edu.au'.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}.png?default=blank&size=${this.size}`;
  }

  userBackgroundStyle(email: string): object {
    // Gravatar hash
    let hash = email != null ? Md5.hashStr(this.email.trim().toLowerCase()) : Md5.hashStr('');

    let backgroundUrl = `https://www.gravatar.com/avatar/${hash}.png?default=blank&size=${this.size}`;
    return {
      'background-image': `url('${backgroundUrl}')`
    };

  }

  get componentSize() {
    return {
      'width.px': this.size,
      'height.px': this.size,
      'min.width.px': this.size,
      'min.height.px': this.size
    };
  }

  get initials() {
    let initials = (this.user?.name != null) ? this.user.name.split(' ') : '  ';
    return (initials.length > 1) ? (`${initials[0][0]}${initials[1][0]}`).toUpperCase() : '  ';
  }
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
