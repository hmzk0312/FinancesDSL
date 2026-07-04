import { ScenarioFormValues } from '../domain/scenario'

export const mockScenarios: ScenarioFormValues[] = [
  {
    id: 'scenario-1',
    name: 'Base Case',
    retirementAge: 60,
    inflationRate: 0.02,
    annualReturnRate: 0.04,
    monthlyExpense: 300000,
    monthlyInvestment: 100000,
    initialAssets: {
      cash: 5000000,
      investment: 10000000,
    },
  },
  {
    id: 'scenario-2',
    name: 'Conservative',
    retirementAge: 65,
    inflationRate: 0.03,
    annualReturnRate: 0.03,
    monthlyExpense: 320000,
    monthlyInvestment: 80000,
    initialAssets: {
      cash: 6000000,
      investment: 9000000,
    },
  },
  {
    id: 'scenario-3',
    name: 'Aggressive',
    retirementAge: 55,
    inflationRate: 0.015,
    annualReturnRate: 0.05,
    monthlyExpense: 280000,
    monthlyInvestment: 150000,
    initialAssets: {
      cash: 4000000,
      investment: 12000000,
    },
  },
]
