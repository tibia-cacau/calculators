import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { ExerciseWeaponsComponent } from './components/exercise-weapons/exercise-weapons.component';
import { ImbuementsCostComponent } from './components/imbuements-cost/imbuements-cost.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';

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
  ],
  providers: [],
})
export class AppModule {}
