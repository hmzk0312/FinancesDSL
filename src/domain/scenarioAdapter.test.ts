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
      monthlyExpense: 150000,
      monthlyInvestment: 250000,
      assets: [
        {
          asset_id: 'cash',
          market_value: 2000000,
          liquidity_profile: 'cash',
          tax_profile: 'none',
          return_profile: { type: 'fixed', annual_rate: 0 },
        },
        {
          asset_id: 'investment',
          market_value: 8000000,
          liquidity_profile: 'liquid',
          tax_profile: 'capital_gains',
          return_profile: { type: 'fixed', annual_rate: 0.08 },
        },
      ],
    }

    const scenario = toScenario(formValues)

    expect(scenario.assumptions.inflation_rate).toBe(0.03)
    expect(scenario.assets.find((asset) => asset.asset_id === 'cash')?.market_value).toBe(2000000)
    expect(scenario.assets.find((asset) => asset.asset_id === 'investment')?.market_value).toBe(8000000)
    expect(scenario.assets.find((asset) => asset.asset_id === 'investment')?.return_profile.annual_rate).toBe(0.08)
  })
})
