import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ExerciseWeaponsComponent } from './components/exercise-weapons/exercise-weapons.component';
import { HttpClientModule } from '@angular/common/http';
import { ImbuementsCostComponent } from './components/imbuements-cost/imbuements-cost.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';
import { TcConfigDialogComponent } from './components/tc-config-dialog/tc-config-dialog.component';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
	declarations: [
		AppComponent,
		ExerciseWeaponsComponent,
		ImbuementsCostComponent,
		TcConfigDialogComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		CommonModule,
		AppRoutingModule,
		ReactiveFormsModule,
		FormsModule,
		MatTooltipModule,
		MatIconModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
