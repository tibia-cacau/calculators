export type ExerciseWeapon = 'regular' | 'durable' | 'lasting';

export type WeaponOption = 'auto' | ExerciseWeapon;

export interface WeaponsObject {
  regular: number;
  durable: number;
  lasting: number;
}

export type Vocation = 'knight' | 'paladin' | 'druid' | 'sorcerer' | 'monk';

export type Skill = 'magic' | 'melee' | 'distance' | 'fist' | 'shield';

export interface CharacterConfig {
  vocation: Vocation;
  skill: Skill;
  currentSkill: number;
  targetSkill: number;
  percentageLeft: number;
  loyaltyBonus: number;
}

export interface ExtraConfig {
  hasDummy: boolean;
  isDouble: boolean;
  exerciseWeapon: WeaponOption;
}

export interface CalculationResult {
  pointsRequired: number;
  weaponsRequired: WeaponsObject;
  cost: {
    tc: number;
    gold: number;
    seconds: number;
  };
}

export interface VocationOption {
  value: Vocation;
  label: string;
  icon: string;
}

export interface SkillOption {
  value: Skill;
  label: string;
}
