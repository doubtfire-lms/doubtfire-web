import { Component, OnInit, Input, Inject } from '@angular/core';
import { currentUser } from 'src/app/ajs-upgraded-providers';
import { Md5 } from 'node_modules/ts-md5/dist/md5';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-test',
    templateUrl: 'user-icon.component.html',
    styleUrls: ['user-icon.component.scss']
})
export class UserIconComponent implements OnInit {
    @Input() user: any;
    @Input() email: string;
    @Input() size: number;

    constructor(
        @Inject(currentUser) private currentUser: any,
        private sanitizer: DomSanitizer) {
    }

    get userBackgroundStyle() {
        const hash = this.email ? Md5.hashStr(this.email.trim().toLowerCase()) : Md5.hashStr('');
        return `https://www.gravatar.com/avatar/${hash}.png?default=blank&size=${this.size}`;
    }

    get initials() {
        const initials = (this.user && this.user.name) ? this.user.name.split(' ') : '  ';
        return (initials.length > 1) ? (`${initials[0][0]}${initials[1][0]}`).toUpperCase() : '  ';
    }

    ngOnInit() {
        if (!this.user) { this.user = this.currentUser.profile; }
        if (!this.email) { this.email = this.currentUser.profile.email; }
    }
}
