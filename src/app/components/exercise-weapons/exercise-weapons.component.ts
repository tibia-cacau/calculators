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
import { TibiaCoinPriceService } from '../../services/tibia-coin-price.service';

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

	tcToGpRate = 37000; // Taxa padrão: 1 TC = 37000 GP
	showTcConfig = false; // Controla visibilidade do campo de configuração

	constructor(
		private fb: FormBuilder,
		private calculator: ExerciseWeaponsCalculatorService,
		private tibiaCoinPriceService: TibiaCoinPriceService
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
			targetSkill: [105],
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
		// Auto-selecionar skill baseado na vocação
		this.characterForm
			.get('vocation')
			?.valueChanges.pipe(takeUntil(this.destroy$))
			.subscribe((vocation: Vocation) => {
				const skillMap: Record<Vocation, Skill> = {
					knight: 'melee',
					paladin: 'distance',
					druid: 'magic',
					sorcerer: 'magic',
					monk: 'fist',
				};
				this.characterForm.patchValue(
					{ skill: skillMap[vocation] },
					{ emitEvent: false }
				);
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

	private calculate(): void {
		const characterConfig: CharacterConfig = this.characterForm.value;
		const extraConfig: ExtraConfig = this.extraForm.value;

		this.result = this.calculator.calculate(characterConfig, extraConfig);

		// Calcular TC baseado no GP e na taxa configurável
		// TCs só podem ser trocadas de 25 em 25, então arredonda para o próximo múltiplo de 25
		if (this.result) {
			const originalGold = this.result.cost.gold;
			const tcRaw = originalGold / this.tcToGpRate;
			this.result.cost.tc = Math.ceil(tcRaw / 25) * 25;
		}

		// Buscar preço em R$ dos Tibia Coins usando regra de três com cache de 50 TC
		if (this.result && this.result.cost.tc > 0) {
			const tcAmount = this.result.cost.tc;

			this.tibiaCoinPriceService
				.calculatePriceForQuantity(tcAmount)
				.pipe(takeUntil(this.destroy$))
				.subscribe((brlPrice) => {
					if (brlPrice !== null && this.result) {
						this.result.cost.brl = brlPrice;
					}
				});
		}
	}

	private saveToLocalStorage(): void {
		localStorage.setItem(
			'ew-character',
			JSON.stringify(this.characterForm.value)
		);
		localStorage.setItem('ew-extra', JSON.stringify(this.extraForm.value));
		localStorage.setItem('ew-tc-rate', this.tcToGpRate.toString());
	}

	private loadFromLocalStorage(): void {
		const savedCharacter = localStorage.getItem('ew-character');
		const savedExtra = localStorage.getItem('ew-extra');
		const savedTcRate = localStorage.getItem('ew-tc-rate');

		if (savedCharacter) {
			this.characterForm.patchValue(JSON.parse(savedCharacter));
		}
		if (savedExtra) {
			this.extraForm.patchValue(JSON.parse(savedExtra));
		}
		if (savedTcRate) {
			this.tcToGpRate = parseFloat(savedTcRate);
		}
	}

	openTcConfig(): void {
		this.showTcConfig = !this.showTcConfig;
	}

	updateTcRate(newRate: number): void {
		if (newRate && newRate > 0) {
			this.tcToGpRate = newRate;
			this.saveToLocalStorage();
			this.calculate();
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

		// Formatar com k, kk, kkk
		if (rounded >= 1000000000) {
			const value = rounded / 1000000000;
			return `${value.toFixed(
				value >= 100 ? 0 : value >= 10 ? 1 : 2
			)}kkk`;
		} else if (rounded >= 1000000) {
			const value = rounded / 1000000;
			return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)}kk`;
		} else if (rounded >= 1000) {
			const value = rounded / 1000;
			return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)}k`;
		}

		return rounded.toString();
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
