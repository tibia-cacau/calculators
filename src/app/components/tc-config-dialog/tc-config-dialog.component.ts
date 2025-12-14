import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface TcConfigData {
	tcToGpRate: number;
}

@Component({
	selector: 'app-tc-config-dialog',
	templateUrl: './tc-config-dialog.component.html',
	styleUrls: ['./tc-config-dialog.component.scss'],
})
export class TcConfigDialogComponent {
	configForm: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<TcConfigDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: TcConfigData,
		private fb: FormBuilder
	) {
		this.configForm = this.fb.group({
			tcToGpRate: [
				data.tcToGpRate,
				[Validators.required, Validators.min(1)],
			],
		});
	}

	onCancel(): void {
		this.dialogRef.close();
	}

	onSave(): void {
		if (this.configForm.valid) {
			this.dialogRef.close(this.configForm.value.tcToGpRate);
		}
	}
}
