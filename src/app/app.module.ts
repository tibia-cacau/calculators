import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { ExerciseWeaponsComponent } from './components/exercise-weapons/exercise-weapons.component';
import { ImbuementsCostComponent } from './components/imbuements-cost/imbuements-cost.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';
import { TibiaTabsComponent } from '../../../../shared-components/tibia-tabs/tibia-tabs.component';

@NgModule({
	declarations: [
		AppComponent,
		ExerciseWeaponsComponent,
		ImbuementsCostComponent,
	],
	imports: [
		CommonModule,
		AppRoutingModule,
		ReactiveFormsModule,
		FormsModule,
		MatTooltipModule,
		MatIconModule,
		TibiaTabsComponent,
	],
	providers: [],
})
export class AppModule {}
