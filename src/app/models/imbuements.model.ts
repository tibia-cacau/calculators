export interface Material {
  name: string;
  amount: number;
  src: string;
}

export interface RecipeSchema {
  name: string;
  npcName: string;
  materials: Material[];
}

export interface StateRecord {
  [key: string]: number;
}

export interface CalculatorArgs {
  tier: number;
  recipeIndex: number;
  stateRecord: StateRecord;
}

export type TokenBuyList = boolean[];

export interface PossibilityRecord {
  cost: number;
  tokenBuyList: TokenBuyList;
}

export interface ShoppingList {
  lowestCost: number;
  tokenCost: number;
  marketCost: number;
  tokenBuyList: TokenBuyList;
}

export interface TierOption {
  name: string;
  value: string;
}

export enum RecordKeys {
  goldToken = 'goldToken',
  tier = 'tier',
}
