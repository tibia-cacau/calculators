import { RouterModule, Routes } from '@angular/router';

import { ExerciseWeaponsComponent } from './components/exercise-weapons/exercise-weapons.component';
import { ImbuementsCostComponent } from './components/imbuements-cost/imbuements-cost.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
	{
		path: '',
		component: ExerciseWeaponsComponent,
	},
	{
		path: 'imbuements',
		component: ImbuementsCostComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
