import { describe, expect, it } from 'vitest'
import { ScenarioFormValues } from './scenario'
import { toScenario } from './scenarioAdapter'

describe('Scenario Adapter', () => {
  it('converts form values to a Scenario with equivalent assumptions and assets', () => {
    const formValues: ScenarioFormValues = {
      id: 'adapter-test',
      name: 'Adapter Test',
      retirementAge: 65,
      inflationRate: 0.03,
      annualReturnRate: 0.08,
      monthlyExpense: 150000,
      monthlyInvestment: 250000,
      initialAssets: {
        cash: 2000000,
        investment: 8000000,
      },
    }

    const scenario = toScenario(formValues)

    expect(scenario.assumptions.inflation_rate).toBe(0.03)
    expect(scenario.assets.find((asset) => asset.asset_id === 'cash')?.market_value).toBe(2000000)
    expect(scenario.assets.find((asset) => asset.asset_id === 'investment')?.market_value).toBe(8000000)
    expect(scenario.assets.find((asset) => asset.asset_id === 'investment')?.return_profile.annual_rate).toBe(0.08)
  })
})
