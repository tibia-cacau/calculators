import {
	CalculationResult,
	CharacterConfig,
	ExtraConfig,
	Skill,
	Vocation,
	WeaponOption,
} from '../../models/exercise-weapons.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
	LOYALTY_MARKS,
	SKILL_OPTIONS,
	VOCATION_OPTIONS,
	WEAPON_OPTIONS,
} from '../../constants/exercise-weapons.constants';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { ExerciseWeaponsCalculatorService } from '../../services/exercise-weapons-calculator.service';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-exercise-weapons',
	templateUrl: './exercise-weapons.component.html',
	styleUrls: ['./exercise-weapons.component.scss'],
})
export class ExerciseWeaponsComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	characterForm!: FormGroup;
	extraForm!: FormGroup;
	result: CalculationResult | null = null;

	vocationOptions = VOCATION_OPTIONS;
	skillOptions = SKILL_OPTIONS;
	weaponOptions = WEAPON_OPTIONS;
	loyaltyMarks = LOYALTY_MARKS;

	constructor(
		private fb: FormBuilder,
		private calculator: ExerciseWeaponsCalculatorService
	) {}

	ngOnInit(): void {
		this.initForms();
		this.loadFromLocalStorage();
		this.setupCalculation();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private initForms(): void {
		this.characterForm = this.fb.group({
			vocation: ['knight'],
			skill: ['melee'],
			currentSkill: [100],
			targetSkill: [110],
			percentageLeft: [0],
			loyaltyBonus: [0],
		});

		this.extraForm = this.fb.group({
			hasDummy: [false],
			isDouble: [false],
			exerciseWeapon: ['auto'],
		});
	}

	private setupCalculation(): void {
		// Detecta mudança de vocação para auto-selecionar skill apropriada
		this.characterForm
			.get('vocation')
			?.valueChanges.pipe(takeUntil(this.destroy$))
			.subscribe((vocation: Vocation) => {
				this.autoSelectSkill(vocation);
			});

		// Recalcula quando qualquer valor mudar
		this.characterForm.valueChanges
			.pipe(takeUntil(this.destroy$), debounceTime(300))
			.subscribe(() => {
				this.calculate();
				this.saveToLocalStorage();
			});

		this.extraForm.valueChanges
			.pipe(takeUntil(this.destroy$), debounceTime(300))
			.subscribe(() => {
				this.calculate();
				this.saveToLocalStorage();
			});

		// Cálculo inicial
		this.calculate();
	}

	private autoSelectSkill(vocation: Vocation): void {
		const skillMap: Record<Vocation, Skill> = {
			knight: 'melee',
			paladin: 'distance',
			druid: 'magic',
			sorcerer: 'magic',
			monk: 'fist',
		};

		const skillToSelect = skillMap[vocation];
		if (skillToSelect) {
			this.characterForm.patchValue(
				{ skill: skillToSelect },
				{ emitEvent: false }
			);
		}
	}

	private calculate(): void {
		const characterConfig: CharacterConfig = this.characterForm.value;
		const extraConfig: ExtraConfig = this.extraForm.value;

		this.result = this.calculator.calculate(characterConfig, extraConfig);
	}

	private saveToLocalStorage(): void {
		localStorage.setItem(
			'ew-character',
			JSON.stringify(this.characterForm.value)
		);
		localStorage.setItem('ew-extra', JSON.stringify(this.extraForm.value));
	}

	private loadFromLocalStorage(): void {
		const savedCharacter = localStorage.getItem('ew-character');
		const savedExtra = localStorage.getItem('ew-extra');

		if (savedCharacter) {
			this.characterForm.patchValue(JSON.parse(savedCharacter));
		}
		if (savedExtra) {
			this.extraForm.patchValue(JSON.parse(savedExtra));
		}
	}

	get invalidSkill(): boolean {
		const current = this.characterForm.get('currentSkill')?.value || 0;
		const target = this.characterForm.get('targetSkill')?.value || 0;
		return target <= current;
	}

	formatTime(seconds: number): string {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		const parts = [];
		if (days > 0) {
			parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
		}
		if (hours > 0) {
			parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
		}
		if (minutes > 0 && days === 0) {
			parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
		}

		return parts.length > 0 ? parts.join(' e ') : '0 minutos';
	}

	formatNumber(num: number): string {
		const rounded = Math.round(num);
		const formatted = new Intl.NumberFormat('pt-BR').format(rounded);

		// Se o número formatado for muito longo (mais de 30 caracteres), trunca
		if (formatted.length > 30) {
			const parts = formatted.split('.');
			if (parts.length > 3) {
				// Mantém apenas os primeiros 3 grupos de números
				return parts.slice(0, 3).join('.') + '...';
			}
		}

		return formatted;
	}

	formatNumberComplete(num: number): string {
		return new Intl.NumberFormat('pt-BR').format(Math.round(num));
	}

	formatTimeComplete(seconds: number): string {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		const parts = [];
		if (days > 0) {
			parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
		}
		if (hours > 0) {
			parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
		}
		if (minutes > 0) {
			parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
		}

		return parts.length > 0 ? parts.join(', ') : '0 minutos';
	}
}
