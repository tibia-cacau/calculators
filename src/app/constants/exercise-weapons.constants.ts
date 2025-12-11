import {
  Skill,
  SkillOption,
  Vocation,
  VocationOption,
  WeaponsObject,
} from '../models/exercise-weapons.model';

const skillPoints: WeaponsObject = {
  regular: 300000,
  durable: 1080000,
  lasting: 8640000,
};

const charges: WeaponsObject = {
  lasting: 14400,
  durable: 1800,
  regular: 500,
};

const goldPrice: WeaponsObject = {
  lasting: 10000000,
  durable: 1250000,
  regular: 347222,
};

const tcPrice: WeaponsObject = {
  lasting: 720,
  durable: 90,
  regular: 25,
};

// Tempo por charge (segundos por charge)
const secondsPerCharge = 2; // 2 segundos por charge

export const EXERCISE_WEAPONS = {
  skillPoints,
  charges,
  goldPrice,
  tcPrice,
  secondsPerCharge,
};

export const DIVIDER = {
  isDouble: 2,
  hasDummy: 1.1,
};

export const VOCATION: Record<Vocation, Record<Skill, number>> = {
  knight: {
    magic: 3,
    melee: 1.1,
    fist: 1.1,
    distance: 1.4,
    shield: 1.1,
  },
  paladin: {
    magic: 1.4,
    melee: 1.2,
    fist: 1.2,
    distance: 1.1,
    shield: 1.1,
  },
  druid: {
    magic: 1.1,
    melee: 1.8,
    fist: 1.5,
    distance: 1.8,
    shield: 1.5,
  },
  sorcerer: {
    magic: 1.1,
    melee: 2,
    fist: 1.5,
    distance: 2,
    shield: 1.5,
  },
  monk: {
    magic: 1.25,
    melee: 1.4,
    fist: 1.1,
    distance: 1.5,
    shield: 1.15,
  },
};

export const SKILLS: Record<Skill, number> = {
  magic: 1600,
  distance: 30,
  melee: 50,
  fist: 50,
  shield: 100,
};

export const VOCATION_OPTIONS: VocationOption[] = [
  { value: 'knight', label: 'Knight', icon: '⚔️' },
  { value: 'paladin', label: 'Paladin', icon: '🏹' },
  { value: 'druid', label: 'Druid', icon: '🌿' },
  { value: 'sorcerer', label: 'Sorcerer', icon: '🔮' },
  { value: 'monk', label: 'Monk', icon: '👊' },
];

export const SKILL_OPTIONS: SkillOption[] = [
  { value: 'magic', label: 'Magic Level' },
  { value: 'melee', label: 'Melee (Sword/Axe/Club)' },
  { value: 'distance', label: 'Distance' },
  { value: 'fist', label: 'Fist Fighting' },
  { value: 'shield', label: 'Shielding' },
];

export const WEAPON_OPTIONS = [
  { value: 'auto', label: 'Auto (Otmizado)' },
  { value: 'lasting', label: 'Lasting (14400 cargas)' },
  { value: 'durable', label: 'Durable (1800 cargas)' },
  { value: 'regular', label: 'Regular (500 cargas)' },
];

export const LOYALTY_MARKS = [
  { value: 0, label: '' },
  { value: 5 },
  { value: 10 },
  { value: 15 },
  { value: 20 },
  { value: 25 },
  { value: 30 },
  { value: 35 },
  { value: 40 },
  { value: 45 },
  { value: 50 },
];
