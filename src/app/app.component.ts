import { Component } from '@angular/core';
import { TabItem } from '../../../../shared-components/tibia-tabs/tibia-tabs.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	tabs: TabItem[] = [
		{ label: 'Exercise Weapons', route: './', icon: '⚔️', exact: true },
		{ label: 'Imbuements Cost', route: './imbuements', icon: '✨' },
	];
}
