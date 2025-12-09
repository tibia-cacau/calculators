import {
  CalculatorArgs,
  PossibilityRecord,
  ShoppingList,
  StateRecord,
  TokenBuyList,
} from '../models/imbuements.model';
import { RECIPES, TIER_BASE_PRICE } from '../constants/imbuements.constants';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImbuementsCalculatorService {
  /**
   * Todas as possíveis combinações de compra (token vs market) para cada tier
   */
  private readonly tierPossibilities: Record<number, TokenBuyList[]> = {
    1: [[true], [false]],
    2: [
      [true, true],
      [true, false],
      [false, false],
    ],
    3: [
      [true, true, true],
      [true, true, false],
      [true, false, false],
      [false, false, false],
    ],
  };

  /**
   * Calcula o custo de um material específico no market
   */
  private calculateMaterialsCost(args: CalculatorArgs): number {
    const { tier, recipeIndex, stateRecord } = args;
    const { materials } = RECIPES[recipeIndex];
    const { name, amount } = materials[tier - 1];

    return (stateRecord[name] ?? 0) * amount;
  }

  /**
   * Calcula o custo de comprar com tokens
   */
  private calculateTokensCost(args: CalculatorArgs): number {
    const { tier, stateRecord } = args;
    const goldTokenPrice = stateRecord['goldToken'];
    return goldTokenPrice * 2 * tier;
  }

  /**
   * Calcula a lista de compras otimizada considerando todas as possibilidades
   */
  calculateShoppingList(args: CalculatorArgs): ShoppingList {
    const { tier: maxTier, recipeIndex, stateRecord } = args;
    const possibilityRecords: PossibilityRecord[] = [];
    const basePrice = TIER_BASE_PRICE[maxTier];

    // Itera sobre todas as possibilidades de compra para o tier atual
    this.tierPossibilities[maxTier].forEach((tokenBuyList) => {
      let cost = basePrice;

      // Para cada material, calcula se é melhor comprar com token ou no market
      tokenBuyList.forEach((buyWithTokens, materialTier) => {
        cost += buyWithTokens
          ? this.calculateTokensCost({
              tier: 1,
              recipeIndex,
              stateRecord,
            })
          : this.calculateMaterialsCost({
              tier: materialTier + 1,
              recipeIndex,
              stateRecord,
            });
      });

      possibilityRecords.push({ cost, tokenBuyList });
    });

    // Ordena por custo crescente
    possibilityRecords.sort((a, b) => a.cost - b.cost);

    // Encontra o menor custo
    const lowestCost = possibilityRecords[0];

    // Calcula custo total com tokens
    const fullTokenCost = possibilityRecords.find(({ tokenBuyList }) =>
      tokenBuyList.every((buyWithToken) => buyWithToken)
    ) as PossibilityRecord;

    // Calcula custo total no market
    const fullMarketCost = possibilityRecords.find(({ tokenBuyList }) =>
      tokenBuyList.every((buyWithToken) => !buyWithToken)
    ) as PossibilityRecord;

    return {
      lowestCost: lowestCost.cost,
      tokenCost: fullTokenCost.cost,
      marketCost: fullMarketCost.cost,
      tokenBuyList: lowestCost.tokenBuyList,
    };
  }

  /**
   * Gera o diálogo NPC baseado nos materiais que devem ser comprados com token
   */
  generateNpcDialogue(recipeIndex: number, tokenBuyList: TokenBuyList): string {
    const tokenImbuementTier = tokenBuyList.filter(
      (buyWithTokens) => buyWithTokens
    ).length;

    if (tokenImbuementTier === 0) {
      return '';
    }

    const { npcName } = RECIPES[recipeIndex];
    const tierNames = ['', 'basic', 'intricate', 'powerful'];
    const tierName = tierNames[tokenImbuementTier];

    return `${npcName} ${tierName} yes`;
  }

  /**
   * Inicializa o estado com valores padrão dos materiais
   */
  initializeState(recipeIndex: number, stateRecord: StateRecord): StateRecord {
    const { materials } = RECIPES[recipeIndex];
    const newState = { ...stateRecord };

    materials.forEach((material) => {
      if (!(material.name in newState)) {
        newState[material.name] = 0;
      }
    });

    return newState;
  }
}
