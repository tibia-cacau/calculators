# 🧮 Tibia Calculators

Projeto Angular com calculadoras para Tibia baseadas no [Exevo Pan](https://github.com/apps/exevo-pan).

## 📊 Calculadoras Disponíveis

### 1. ⚔️ Exercise Weapons Calculator

Calcula o custo e tempo necessário para treinar skills usando exercise weapons.

#### Inputs:
- **Vocation**: knight, paladin, druid, sorcerer, monk
- **Skill Type**: magic, melee, distance, fist, shield
- **Current Skill**: Skill atual (inclui loyalty bonus)
- **Target Skill**: Skill desejado
- **Percentage Left**: Progresso no nível atual (0-100%)
- **Loyalty Bonus**: Bônus de lealdade (0-50, incrementos de 5)
- **Exercise Dummy**: Multiplica eficiência por 1.1x
- **Double Event**: Multiplica eficiência por 2x
- **Weapon Type**: Auto (otimizado), Lasting, Durable, Regular

#### Outputs:
- **Money Cost**: Gold e Tibia Coins necessários
- **Weapons Needed**: Quantidade de cada tipo de arma
- **Time Required**: Tempo total de treinamento

#### Constantes:

**Exercise Weapons:**
```typescript
EXERCISE_WEAPONS = {
  regular: {
    skillPoints: 300000,
    charges: 500,
    goldPrice: 347222,
    tcPrice: 25,
    seconds: 1000
  },
  durable: {
    skillPoints: 1080000,
    charges: 1800,
    goldPrice: 1250000,
    tcPrice: 90,
    seconds: 3600
  },
  lasting: {
    skillPoints: 8640000,
    charges: 14400,
    goldPrice: 10000000,
    tcPrice: 720,
    seconds: 28800
  }
}
```

**Vocation Multipliers:**
```typescript
VOCATION_MULTIPLIERS = {
  knight: {
    magic: 3.0, melee: 1.1, distance: 1.4, fist: 1.1, shield: 1.1
  },
  paladin: {
    magic: 1.4, melee: 1.2, distance: 1.1, fist: 1.2, shield: 1.1
  },
  druid: {
    magic: 1.1, melee: 1.8, distance: 1.8, fist: 1.5, shield: 1.5
  },
  sorcerer: {
    magic: 1.1, melee: 2.0, distance: 2.0, fist: 1.5, shield: 1.5
  },
  monk: {
    magic: 1.25, melee: 1.4, distance: 1.5, fist: 1.1, shield: 1.15
  }
}
```

**Skill Constants:**
```typescript
SKILL_CONSTANTS = {
  magic: 1600,
  distance: 30,
  melee: 50,
  fist: 50,
  shield: 100
}
```

#### Fórmulas:

**1. Converter Skill para Pontos:**
```typescript
skillToPoints(skill, vocationConstant, skillConstant) {
  return skillConstant * (Math.pow(vocationConstant, skill) - 1) / (vocationConstant - 1)
}
```

**2. Pontos para Próximo Nível:**
```typescript
pointsToAdvance(skill, vocationConstant, skillConstant) {
  return skillConstant * Math.pow(vocationConstant, skill)
}
```

**3. Calcular Pontos Necessários:**
```typescript
calculateRequiredPoints(currentSkill, targetSkill, percentageLeft, loyaltyBonus) {
  const currentPoints = skillToPoints(currentSkill)
  const targetPoints = skillToPoints(targetSkill)
  let requiredPoints = targetPoints - currentPoints
  
  if (targetSkill - currentSkill === 1) {
    requiredPoints = requiredPoints * (percentageLeft / 100)
  } else {
    const pointsToNext = pointsToAdvance(currentSkill)
    requiredPoints = requiredPoints - pointsToNext * (1 - percentageLeft / 100)
  }
  
  // Aplicar loyalty bonus
  const finalPoints = requiredPoints / (1 + loyaltyBonus / 100)
  
  // Aplicar multiplicadores de evento/dummy
  let divider = 1
  if (hasDummy) divider *= 1.1
  if (isDouble) divider *= 2
  
  return finalPoints / divider
}
```

**4. Calcular Quantidade de Armas (Auto Mode):**
```typescript
calculateWeaponsAuto(pointsRequired) {
  const lasting = Math.floor(pointsRequired / 8640000)
  const remainingAfterLasting = pointsRequired % 8640000
  
  const durable = Math.floor(remainingAfterLasting / 1080000)
  const remainingAfterDurable = remainingAfterLasting % 1080000
  
  const regular = Math.ceil(remainingAfterDurable / 300000)
  
  return { lasting, durable, regular }
}
```

**5. Calcular Custo Total:**
```typescript
calculateTotalCost(weapons) {
  const gold = weapons.lasting * 10000000 + 
               weapons.durable * 1250000 + 
               weapons.regular * 347222
  
  const tc = weapons.lasting * 720 + 
             weapons.durable * 90 + 
             weapons.regular * 25
  
  const seconds = weapons.lasting * 28800 + 
                  weapons.durable * 3600 + 
                  weapons.regular * 1000
  
  return { gold, tc, seconds }
}
```

---

### 2. ✨ Imbuements Cost Calculator

Calcula a forma mais econômica de fazer imbuements, comparando Gold Tokens vs Market.

#### Inputs:
- **Gold Token Price**: Valor do gold token no mercado (default: 20000 gp)
- **Imbuement Type**: Vampirism (Life Leech), Void (Mana Leech), Strike (Critical)
- **Tier**: Basic (I), Intricate (II), Powerful (III)
- **Material Prices**: Preço de mercado de cada material necessário

#### Outputs:
- **Lowest Cost**: Menor custo possível (otimizado)
- **Token Cost**: Custo comprando tudo com tokens
- **Market Cost**: Custo comprando tudo no market
- **Strategy**: Para cada material, indica se deve usar token ou market
- **NPC Dialogue**: Comando para usar no NPC

#### Imbuements e Materiais:

**Vampirism (Life Leech):**
```typescript
vampirism = {
  tier1: {
    basePrice: 15000,
    materials: [
      { name: 'Vampire Teeth', amount: 25, tokenCost: 2 }
    ]
  },
  tier2: {
    basePrice: 60000,
    materials: [
      { name: 'Vampire Teeth', amount: 25, tokenCost: 2 },
      { name: 'Bloody Pincers', amount: 15, tokenCost: 2 }
    ]
  },
  tier3: {
    basePrice: 250000,
    materials: [
      { name: 'Vampire Teeth', amount: 25, tokenCost: 2 },
      { name: 'Bloody Pincers', amount: 15, tokenCost: 2 },
      { name: 'Piece of Dead Brain', amount: 5, tokenCost: 2 }
    ]
  }
}
```

**Void (Mana Leech):**
```typescript
void = {
  tier1: {
    basePrice: 15000,
    materials: [
      { name: 'Rope Belt', amount: 25, tokenCost: 2 }
    ]
  },
  tier2: {
    basePrice: 60000,
    materials: [
      { name: 'Rope Belt', amount: 25, tokenCost: 2 },
      { name: 'Silencer Claws', amount: 25, tokenCost: 2 }
    ]
  },
  tier3: {
    basePrice: 250000,
    materials: [
      { name: 'Rope Belt', amount: 25, tokenCost: 2 },
      { name: 'Silencer Claws', amount: 25, tokenCost: 2 },
      { name: 'Grimeleech Wings', amount: 5, tokenCost: 2 }
    ]
  }
}
```

**Strike (Critical):**
```typescript
strike = {
  tier1: {
    basePrice: 15000,
    materials: [
      { name: 'Protective Charm', amount: 20, tokenCost: 2 }
    ]
  },
  tier2: {
    basePrice: 60000,
    materials: [
      { name: 'Protective Charm', amount: 20, tokenCost: 2 },
      { name: 'Sabretooth', amount: 25, tokenCost: 2 }
    ]
  },
  tier3: {
    basePrice: 250000,
    materials: [
      { name: 'Protective Charm', amount: 20, tokenCost: 2 },
      { name: 'Sabretooth', amount: 25, tokenCost: 2 },
      { name: 'Vexclaw Talon', amount: 5, tokenCost: 2 }
    ]
  }
}
```

#### Fórmulas:

**1. Custo com Tokens:**
```typescript
calculateTokenCost(tier, goldTokenPrice) {
  const tokensNeeded = tier * 2  // Tier I=2, Tier II=4, Tier III=6
  return tokensNeeded * goldTokenPrice
}
```

**2. Custo com Market:**
```typescript
calculateMarketCost(materials) {
  return materials.reduce((total, material) => {
    return total + (material.amount * material.marketPrice)
  }, 0)
}
```

**3. Otimização (Menor Custo):**
```typescript
findOptimalStrategy(imbuement, tier, goldTokenPrice, materialPrices) {
  const basePrice = imbuement[`tier${tier}`].basePrice
  const materials = imbuement[`tier${tier}`].materials
  
  // Calcula todas as possibilidades (2^n combinações)
  const possibilities = []
  const numMaterials = materials.length
  
  for (let i = 0; i < Math.pow(2, numMaterials); i++) {
    let cost = basePrice
    const strategy = []
    
    for (let j = 0; j < numMaterials; j++) {
      const useToken = (i >> j) & 1
      const material = materials[j]
      
      if (useToken) {
        cost += material.tokenCost * goldTokenPrice
        strategy.push(true)
      } else {
        cost += material.amount * materialPrices[j]
        strategy.push(false)
      }
    }
    
    possibilities.push({ cost, strategy })
  }
  
  // Retorna a estratégia com menor custo
  return possibilities.reduce((best, current) => 
    current.cost < best.cost ? current : best
  )
}
```

**4. Gerar Comando NPC:**
```typescript
generateNPCDialogue(imbuementType, tier) {
  const tierNames = ['basic', 'intricate', 'powerful']
  return `${imbuementType.toLowerCase()} ${tierNames[tier - 1]} yes`
}
```

---

## 🛠️ Implementação Angular

### Estrutura de Componentes:

```
app/
├── components/
│   ├── exercise-weapons/
│   │   ├── character-config/
│   │   │   ├── character-config.component.ts
│   │   │   ├── character-config.component.html
│   │   │   └── character-config.component.scss
│   │   ├── summary/
│   │   │   ├── summary.component.ts
│   │   │   ├── summary.component.html
│   │   │   └── summary.component.scss
│   │   ├── exercise-weapons.component.ts
│   │   ├── exercise-weapons.component.html
│   │   └── exercise-weapons.component.scss
│   └── imbuements-cost/
│       ├── material-input/
│       │   ├── material-input.component.ts
│       │   ├── material-input.component.html
│       │   └── material-input.component.scss
│       ├── results/
│       │   ├── results.component.ts
│       │   ├── results.component.html
│       │   └── results.component.scss
│       ├── imbuements-cost.component.ts
│       ├── imbuements-cost.component.html
│       └── imbuements-cost.component.scss
├── services/
│   ├── exercise-weapons.service.ts
│   └── imbuements.service.ts
├── models/
│   ├── exercise-weapons.model.ts
│   └── imbuements.model.ts
└── constants/
    ├── exercise-weapons.constants.ts
    └── imbuements.constants.ts
```

---

## 🎨 Estilo Tibia Cacau

Paleta de cores aplicada:
- **Amarelo Cacau**: `#D9A441` - Primary actions
- **Verde Musgo**: `#3E5C3A` - Headers e destaque
- **Marrom Cacau**: `#4B2E05` - Text base
- **Bege Casca**: `#E8D7B1` - Backgrounds
- **Cinza Rocha**: `#5E5E5E` - Body text

---

## 📝 Créditos

Baseado no projeto [Exevo Pan](https://github.com/apps/exevo-pan) - Um excelente site de ferramentas para Tibia desenvolvido em React/Next.js.

---

## 🚀 Próximos Passos

1. Criar componentes Angular
2. Implementar serviços de cálculo
3. Criar interfaces de modelos
4. Adicionar testes unitários
5. Integrar com o shell principal
6. Deploy no KingHost
