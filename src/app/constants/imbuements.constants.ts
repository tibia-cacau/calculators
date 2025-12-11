import {
  RecipeSchema,
  RecordKeys,
  TierOption,
} from '../models/imbuements.model';

export const TIER_OPTIONS: TierOption[] = [
  { name: 'Powerful (III)', value: '3' },
  { name: 'Intricate (II)', value: '2' },
  { name: 'Basic (I)', value: '1' },
];

export const DEFAULT_STATE = {
  [RecordKeys.goldToken]: 20000,
  [RecordKeys.tier]: 3,
};

export const RECIPES: RecipeSchema[] = [
  {
    name: 'Vampirism (life leech)',
    npcName: 'vampirism',
    materials: [
      {
        name: 'Vampire Teeth',
        amount: 25,
        src: '/assets/images/imbuements/vampireTeeth.png',
      },
      {
        name: 'Bloody Pincers',
        amount: 15,
        src: '/assets/images/imbuements/bloodyPincers.png',
      },
      {
        name: 'Piece of Dead Brain',
        amount: 5,
        src: '/assets/images/imbuements/deadBrain.png',
      },
    ],
  },
  {
    name: 'Void (mana leech)',
    npcName: 'void',
    materials: [
      {
        name: 'Rope Belt',
        amount: 25,
        src: '/assets/images/imbuements/ropeBelt.png',
      },
      {
        name: 'Silencer Claws',
        amount: 25,
        src: '/assets/images/imbuements/silencerClaws.png',
      },
      {
        name: 'Grimeleech Wings',
        amount: 5,
        src: '/assets/images/imbuements/grimeleech.png',
      },
    ],
  },
  {
    name: 'Strike (critical)',
    npcName: 'strike',
    materials: [
      {
        name: 'Protective Charm',
        amount: 20,
        src: '/assets/images/imbuements/protectiveCharm.png',
      },
      {
        name: 'Sabretooth',
        amount: 25,
        src: '/assets/images/imbuements/sabretooth.png',
      },
      {
        name: 'Vexclaw Talon',
        amount: 5,
        src: '/assets/images/imbuements/vexclawTalon.png',
      },
    ],
  },
];

export const TIER_BASE_PRICE: Record<number, number> = {
  1: 15000,
  2: 60000,
  3: 250000,
};

export const TIER_NAME: Record<number, string> = {
  1: 'basic',
  2: 'intricate',
  3: 'powerful',
};
