import { ScenarioFormValues } from '../domain/scenario'

export const mockScenarios: ScenarioFormValues[] = [
  {
    id: 'scenario-1',
    name: 'Base Case',
    retirementAge: 60,
    inflationRate: 0.02,
    monthlyExpense: 300000,
    monthlyInvestment: 100000,
    assets: [
      {
        asset_id: 'cash',
        market_value: 5000000,
        liquidity_profile: 'cash',
        tax_profile: 'none',
        return_profile: { type: 'fixed', annual_rate: 0 },
      },
      {
        asset_id: 'investment',
        market_value: 10000000,
        liquidity_profile: 'liquid',
        tax_profile: 'capital_gains',
        return_profile: { type: 'fixed', annual_rate: 0.04 },
      },
    ],
  },
  {
    id: 'scenario-2',
    name: 'Conservative',
    retirementAge: 65,
    inflationRate: 0.03,
    monthlyExpense: 320000,
    monthlyInvestment: 80000,
    assets: [
      {
        asset_id: 'cash',
        market_value: 6000000,
        liquidity_profile: 'cash',
        tax_profile: 'none',
        return_profile: { type: 'fixed', annual_rate: 0 },
      },
      {
        asset_id: 'investment',
        market_value: 9000000,
        liquidity_profile: 'liquid',
        tax_profile: 'capital_gains',
        return_profile: { type: 'fixed', annual_rate: 0.03 },
      },
    ],
  },
  {
    id: 'scenario-3',
    name: 'Aggressive',
    retirementAge: 55,
    inflationRate: 0.015,
    monthlyExpense: 280000,
    monthlyInvestment: 150000,
    assets: [
      {
        asset_id: 'cash',
        market_value: 4000000,
        liquidity_profile: 'cash',
        tax_profile: 'none',
        return_profile: { type: 'fixed', annual_rate: 0 },
      },
      {
        asset_id: 'investment',
        market_value: 12000000,
        liquidity_profile: 'liquid',
        tax_profile: 'capital_gains',
        return_profile: { type: 'fixed', annual_rate: 0.05 },
      },
    ],
  },
]
