import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  DEFAULT_STATE,
  RECIPES,
  TIER_OPTIONS,
} from '../../constants/imbuements.constants';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  RecordKeys,
  ShoppingList,
  StateRecord,
} from '../../models/imbuements.model';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { ImbuementsCalculatorService } from '../../services/imbuements-calculator.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-imbuements-cost',
  templateUrl: './imbuements-cost.component.html',
  styleUrls: ['./imbuements-cost.component.scss'],
})
export class ImbuementsCostComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  configForm!: FormGroup;
  materialForms: FormGroup[] = [];

  recipes = RECIPES;
  tierOptions = TIER_OPTIONS;
  selectedRecipeIndex = 0;

  stateRecord: StateRecord = { ...DEFAULT_STATE };
  result: ShoppingList | null = null;
  npcDialogue = '';

  constructor(
    private fb: FormBuilder,
    private calculator: ImbuementsCalculatorService
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
    this.configForm = this.fb.group({
      goldToken: [DEFAULT_STATE[RecordKeys.goldToken]],
      tier: [DEFAULT_STATE[RecordKeys.tier]],
    });

    // Cria um form para cada receita
    this.recipes.forEach((recipe) => {
      const group: any = {};
      recipe.materials.forEach((material) => {
        group[material.name] = [0];
      });
      this.materialForms.push(this.fb.group(group));
    });
  }

  private setupCalculation(): void {
    // Recalcula quando config mudar
    this.configForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.updateStateRecord();
        this.calculate();
        this.saveToLocalStorage();
      });

    // Recalcula quando materiais mudarem
    this.materialForms.forEach((form) => {
      form.valueChanges
        .pipe(takeUntil(this.destroy$), debounceTime(300))
        .subscribe(() => {
          this.updateStateRecord();
          this.calculate();
          this.saveToLocalStorage();
        });
    });

    // Cálculo inicial
    this.updateStateRecord();
    this.calculate();
  }

  private updateStateRecord(): void {
    this.stateRecord = {
      ...this.configForm.value,
      ...this.materialForms[this.selectedRecipeIndex].value,
    };
  }

  private calculate(): void {
    this.result = this.calculator.calculateShoppingList({
      tier: this.stateRecord[RecordKeys.tier],
      recipeIndex: this.selectedRecipeIndex,
      stateRecord: this.stateRecord,
    });

    this.npcDialogue = this.calculator.generateNpcDialogue(
      this.selectedRecipeIndex,
      this.result.tokenBuyList
    );
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('imb-config', JSON.stringify(this.configForm.value));
    this.materialForms.forEach((form, index) => {
      localStorage.setItem(
        `imb-materials-${index}`,
        JSON.stringify(form.value)
      );
    });
    localStorage.setItem('imb-recipe', this.selectedRecipeIndex.toString());
  }

  private loadFromLocalStorage(): void {
    const savedConfig = localStorage.getItem('imb-config');
    const savedRecipe = localStorage.getItem('imb-recipe');

    if (savedConfig) {
      this.configForm.patchValue(JSON.parse(savedConfig));
    }

    if (savedRecipe) {
      this.selectedRecipeIndex = parseInt(savedRecipe, 10);
    }

    this.materialForms.forEach((form, index) => {
      const saved = localStorage.getItem(`imb-materials-${index}`);
      if (saved) {
        form.patchValue(JSON.parse(saved));
      }
    });
  }

  selectRecipe(index: number): void {
    this.selectedRecipeIndex = index;
    this.updateStateRecord();
    this.calculate();
    this.saveToLocalStorage();
  }

  getCurrentMaterials() {
    const currentTier = this.configForm.get('tier')?.value || 3;
    return this.recipes[this.selectedRecipeIndex].materials.slice(
      0,
      currentTier
    );
  }

  shouldBuyWithToken(materialIndex: number): boolean {
    return this.result?.tokenBuyList[materialIndex] || false;
  }

  isUsedInCurrentTier(materialIndex: number): boolean {
    const currentTier = this.configForm.get('tier')?.value || 3;
    return materialIndex < currentTier;
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('pt-BR').format(Math.round(num));
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }

  getSavings(): number {
    if (!this.result) return 0;
    const higher = Math.max(this.result.tokenCost, this.result.marketCost);
    return higher - this.result.lowestCost;
  }

  getSavingsPercentage(): number {
    if (!this.result) return 0;
    const higher = Math.max(this.result.tokenCost, this.result.marketCost);
    if (higher === 0) return 0;
    return ((higher - this.result.lowestCost) / higher) * 100;
  }

  getTierBadge(materialIndex: number): string {
    const badges = ['25x', '15x', '5x'];
    return badges[materialIndex] || '';
  }
}
