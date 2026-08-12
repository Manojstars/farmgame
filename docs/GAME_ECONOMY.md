# Farm Life Game Economy

## Overview

Farm Life uses a balanced economy to keep gameplay engaging:
- **Farming** generates coins through crop sales
- **Marketplace** creates dynamic pricing
- **Contracts** provide premium rewards
- **Progression** unlocks better earnings

## Resource Types

### Coins (Primary Currency)
- Earned from: Farming, marketplace sales, contracts
- Spent on: Animal feed, building upgrades, farm expansion
- Start with: 50 coins

### Gems (Premium Currency)
- Earned from: Special events, achievements
- Spent on: Speed-ups, exclusive items
- Start with: 0 gems (optional IAP)

### XP (Experience Points)
- Earned from: Harvesting, completing contracts
- Purpose: Level progression
- Level-up rewards: New crops, animals, buildings

### Energy
- Earned from: Natural regeneration, consumables
- Spent on: Special activities
- Max: 100
- Regen rate: 1 point per 5 minutes (12 per hour)

## Crop Economics

### Crop Types

| Crop | Growth Time | Base Price | XP | Unlock Level |
|------|-------------|------------|-----|--------------|
| Wheat | 5 min | 50 | 10 | 1 |
| Corn | 10 min | 100 | 15 | 2 |
| Pumpkin | 15 min | 150 | 20 | 3 |
| Tomato | 8 min | 75 | 12 | 4 |
| Carrot | 6 min | 60 | 11 | 5 |

### Earnings Calculation

```
Base Earnings = Crop Base Price
Market Multiplier = 0.5 + (2.0 * (1 - Supply Level))
Final Earnings = Base Earnings * Market Multiplier

Example:
- Wheat base: 50 coins
- Supply high (80%): 50 * (0.5 + 2.0 * 0.2) = 50 * 0.9 = 45 coins
- Supply low (20%): 50 * (0.5 + 2.0 * 0.8) = 50 * 2.1 = 105 coins
```

### Upgrade Path

Crops can be upgraded for better yields:

| Upgrade | Unlock Level | Cost | Benefit |
|---------|--------------|------|---------|
| Level 2 | 5 | 100 coins | +20% earnings |
| Level 3 | 10 | 200 coins | +40% earnings |
| Level 4 | 15 | 500 coins | +60% earnings |
| Level 5 | 20 | 1000 coins | +100% earnings |

## Animal Economics

### Animal Types

| Animal | Production Time | Base Value | Feed Cost | XP | Unlock |
|--------|-----------------|------------|-----------|-----|--------|
| Cow | 10 min | 50 | 20 | 10 | Lvl 1 |
| Chicken | 5 min | 30 | 10 | 8 | Lvl 2 |
| Sheep | 8 min | 40 | 15 | 9 | Lvl 3 |
| Pig | 12 min | 60 | 25 | 12 | Lvl 4 |
| Horse | 15 min | 80 | 30 | 15 | Lvl 5 |

### Feeding Economics

```
Daily Feed Cost = Feed Cost per Animal * Number of Animals
Daily Income = (Production Value * (24 * 60) / Production Time)
Daily Profit = Daily Income - Daily Feed Cost

Example (1 Cow):
- Feed: 20 coins/day
- Production time: 10 min
- Productions/day: 144
- Daily income: 144 * 50 = 7200 coins
- Daily profit: 7200 - 20 = 7180 coins
```

### Efficiency

Animals are more efficient than crops for long-term play:

```
Wheat (best crop):
- 5 min growth
- 50 coins/harvest
- 600 coins/hour

Cow (animal):
- 10 min production
- 50 coins + 50 coins = 100 coins/cycle
- 600 coins/hour + animals passive earn while offline
```

## Marketplace System

### Price Dynamics

Market prices fluctuate based on supply and demand:

```
Current Price = Base Price * Supply Multiplier

Supply Levels:
- Very High (>75%): 0.5x (50% of base)
- High (50-75%): 0.75x (75% of base)
- Normal (25-50%): 1.0x (100% of base)
- Low (10-25%): 1.5x (150% of base)
- Very Low (<10%): 2.0x (200% of base)
```

### Supply Changes

Supply level is affected by:
- Player harvests: -2% supply (adds item to market)
- Market time decay: +1% supply/hour (items used up)
- Server reset: Back to 50% (daily)

### Trading Strategy

Smart players manage supply:
- **Hold crops** when supply is high (wait for prices to rise)
- **Sell immediately** when supply is low (maximize profit)
- **Diversify crops** to average out price fluctuations

## Contracts

### Contract Types

Contracts offer premium rewards:

| Type | Duration | Reward | Frequency |
|------|----------|--------|-----------|
| Basic | 1 hour | 200 coins + 50 XP | Common |
| Advanced | 4 hours | 500 coins + 150 XP | Uncommon |
| Expert | 8 hours | 1000 coins + 300 XP | Rare |
| Legendary | 24 hours | 5000 coins + 1000 XP | Very Rare |

### Contract Math

```
Contract Value = (Time Hours * 100 coins/hour) + (Time Hours * 50 XP/hour)

Example (4-hour contract):
- Coins: 4 * 100 = 400 coins
- XP: 4 * 50 = 200 XP
```

## Energy System

### Energy Usage

```
Base Regeneration: 1 energy / 5 minutes
Activities:
- Harvest: Free
- Complete building: 5 energy
- Speed-up with gems: Variable
```

### Energy Strategies

```
Max energy: 100
Wait time to refill: 500 minutes (8.3 hours)

Smart play:
- Don't let energy cap naturally (waste of potential)
- Use energy on premium activities
- Can buy gem refills for rush events
```

## Progression & Unlocks

### Level Requirements

| Level | XP Needed | Cumulative | Unlock |
|-------|-----------|-----------|--------|
| 1 | 0 | 0 | Start game |
| 2 | 100 | 100 | Corn crop |
| 3 | 150 | 250 | Chicken animal |
| 4 | 200 | 450 | Pumpkin crop |
| 5 | 250 | 700 | Sheep animal |
| 10 | 500 | 4700 | Marketplace |
| 15 | 750 | 10700 | Building system |
| 20 | 1000 | 20200 | Contracts |

### Level-based Unlocks

- **Farm Expansion**: Each level +1 plot (capped at 25)
- **Animal Capacity**: Every 2 levels +1 animal slot
- **Crop Variety**: New crops at levels 2, 4, 6, 8, etc.
- **Building Types**: Premium buildings unlock at higher levels

## Monetization (Optional)

Farm Life includes optional in-app purchases:

### Gem Packages

| Package | Price | Gems | Rate |
|---------|-------|------|------|
| Small | $0.99 | 50 | $0.02/gem |
| Medium | $4.99 | 300 | $0.017/gem |
| Large | $9.99 | 700 | $0.014/gem |

### Gem Uses

- Speed-ups: 10 gems per hour
- Premium building: 100 gems
- Special events: Variable
- Energy refill: 25 gems

### Free Gem Sources

- Achievements: 5-50 gems
- Daily login: 1-5 gems
- Rare events: 10-100 gems
- Level milestones: 10-50 gems

## Economy Balancing

### Key Metrics

- **Time to level**: ~1 hour per level (early game)
- **Daily active players earnings**: 500-1000 coins
- **Premium currency gap**: Free players don't feel blocked
- **Power progression**: Level 20 = 4x earnings of level 1

### Remote Config Tuning

Economy can be adjusted without app update:

```json
{
  "cropGrowthSpeedMultiplier": 1.0,
  "animalProductionSpeedMultiplier": 1.0,
  "coinEarningMultiplier": 1.0,
  "xpEarningMultiplier": 1.0,
  "energyRegenerationRate": 1.0,
  "marketPriceVolatility": 0.5
}
```

### Common Tuning Scenarios

**Players earning too quickly:**
- Reduce `coinEarningMultiplier` to 0.8
- Increase crop growth times

**Players getting stuck:**
- Increase `xpEarningMultiplier` to 1.2
- Reduce contract cooldowns

**Market too stable:**
- Increase `marketPriceVolatility` to 1.0
- Reduce supply decay rate

## Testing Economy

See [tests/economy.test.ts](../tests/economy.test.ts) for test cases.

Run tests:
```bash
npm test -- economy.test.ts
```

## See Also

- [Farming Mechanics](../tests/farming.test.ts)
- [Animal Mechanics](../tests/animals.test.ts)
- [Firebase Configuration](./FIREBASE.md)
