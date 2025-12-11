import {
  CalculationResult,
  CharacterConfig,
  ExerciseWeapon,
  ExtraConfig,
  Skill,
  Vocation,
  WeaponsObject,
} from '../models/exercise-weapons.model';
import {
  DIVIDER,
  EXERCISE_WEAPONS,
  SKILLS,
  VOCATION,
} from '../constants/exercise-weapons.constants';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExerciseWeaponsCalculatorService {
  /**
   * Calcula os pontos de skill necessários desde o nível inicial até o nível base
   * NOTA: O cálculo original do Exevo Pan usa SEMPRE a constante de magic (1600)
   * independente do skill selecionado. Mantemos isso para compatibilidade.
   */
  private skillToPoints(
    vocation: Vocation,
    skill: Skill,
    skillLevel: number
  ): number {
    const vocationMult = VOCATION[vocation][skill];
    // Usa sempre a constante de magic, como no código React original
    const constant = SKILLS.magic;

    const numerator = Math.pow(vocationMult, skillLevel) - 1;
    const denominator = vocationMult - 1;

    return constant * (numerator / denominator);
  }

  /**
   * Calcula os pontos necessários para avançar exatamente 1 nível
   */
  private pointsToAdvance(
    vocation: Vocation,
    skill: Skill,
    skillLevel: number
  ): number {
    const vocationMult = VOCATION[vocation][skill];
    // Usa sempre a constante de magic, como no código React original
    const constant = SKILLS.magic;
    return constant * Math.pow(vocationMult, skillLevel);
  }

  /**
   * Calcula quantos pontos são necessários para avançar do currentSkill até targetSkill
   */
  requiredSkillPoints(config: CharacterConfig): number {
    const {
      currentSkill,
      targetSkill,
      vocation,
      skill,
      percentageLeft,
      loyaltyBonus,
    } = config;

    if (targetSkill <= currentSkill) return 0;

    // Calcula os pontos totais para current e target
    const currentPoints = this.skillToPoints(vocation, skill, currentSkill);
    const targetPoints = this.skillToPoints(vocation, skill, targetSkill);

    // Pontos necessários sem considerar o percentageLeft
    const requiredPoints = targetPoints - currentPoints;

    // Percentual que já foi completado no nível atual
    // Inverted: user fills % remaining, so we need to convert to % completed
    const currentCompletedPercentage = (100 - percentageLeft) / 100;

    let totalRequiredPoints = 0;

    // Se é apenas 1 nível de diferença
    if (targetSkill - currentSkill === 1) {
      totalRequiredPoints = requiredPoints * currentCompletedPercentage;
    } else {
      // Múltiplos níveis: subtrai o que já foi feito no nível atual
      const pointsToNext = this.pointsToAdvance(vocation, skill, currentSkill);
      totalRequiredPoints =
        requiredPoints - pointsToNext * (1 - currentCompletedPercentage);
    }

    // Aplica o bônus de loyalty (divide porque loyalty reduz pontos necessários)
    return totalRequiredPoints / (1 + loyaltyBonus / 100);
  }

  /**
   * Calcula automaticamente a quantidade otimizada de cada tipo de arma
   * Prioriza: lasting > durable > regular
   */
  private autoRequiredWeaponsCount(pointsRequired: number): WeaponsObject {
    let remainingPoints = pointsRequired;
    const weapons: WeaponsObject = { lasting: 0, durable: 0, regular: 0 };

    // Maximiza lasting weapons
    weapons.lasting = Math.floor(
      remainingPoints / EXERCISE_WEAPONS.skillPoints.lasting
    );
    remainingPoints -= weapons.lasting * EXERCISE_WEAPONS.skillPoints.lasting;

    // Depois durable weapons
    weapons.durable = Math.floor(
      remainingPoints / EXERCISE_WEAPONS.skillPoints.durable
    );
    remainingPoints -= weapons.durable * EXERCISE_WEAPONS.skillPoints.durable;

    // Finalmente regular weapons
    weapons.regular = Math.ceil(
      remainingPoints / EXERCISE_WEAPONS.skillPoints.regular
    );

    return weapons;
  }

  /**
   * Calcula a quantidade necessária de um único tipo de arma
   */
  private customRequiredWeaponsCount(
    pointsRequired: number,
    weaponType: ExerciseWeapon
  ): WeaponsObject {
    const weapons: WeaponsObject = { lasting: 0, durable: 0, regular: 0 };
    weapons[weaponType] = Math.ceil(
      pointsRequired / EXERCISE_WEAPONS.skillPoints[weaponType]
    );
    return weapons;
  }

  /**
   * Calcula o custo total baseado nas armas necessárias
   */
  private skillCost(weapons: WeaponsObject): {
    tc: number;
    gold: number;
    seconds: number;
  } {
    let tc = 0;
    let gold = 0;
    let totalCharges = 0;

    (Object.keys(weapons) as ExerciseWeapon[]).forEach((weaponType) => {
      const count = weapons[weaponType];
      tc += count * EXERCISE_WEAPONS.tcPrice[weaponType];
      gold += count * EXERCISE_WEAPONS.goldPrice[weaponType];
      totalCharges += count * EXERCISE_WEAPONS.charges[weaponType];
    });

    // Tempo = total de charges × 2 segundos por charge
    const seconds = totalCharges * EXERCISE_WEAPONS.secondsPerCharge;

    return { tc, gold, seconds };
  }

  /**
   * Calcula todos os resultados necessários
   */
  calculate(
    characterConfig: CharacterConfig,
    extraConfig: ExtraConfig
  ): CalculationResult {
    // Calcula pontos base necessários
    let pointsRequired = this.requiredSkillPoints(characterConfig);

    // Aplica divisores (dummy e double event)
    if (extraConfig.hasDummy) {
      pointsRequired /= DIVIDER.hasDummy;
    }
    if (extraConfig.isDouble) {
      pointsRequired /= DIVIDER.isDouble;
    }

    // Calcula armas necessárias
    const weaponsRequired =
      extraConfig.exerciseWeapon === 'auto'
        ? this.autoRequiredWeaponsCount(pointsRequired)
        : this.customRequiredWeaponsCount(
            pointsRequired,
            extraConfig.exerciseWeapon
          );

    // Calcula custos
    const cost = this.skillCost(weaponsRequired);

    return {
      pointsRequired,
      weaponsRequired,
      cost,
    };
  }
}
