import { Scenario, ScenarioFormValues, Asset } from './scenario'

export const DEFAULT_SCENARIO: Scenario = {
  assumptions: {
    birth_date: '1980-01-01',
    simulation_start_month: '2026-06-01',
    simulation_end_age: 95,
    inflation_rate: 0.02,
    tax_rates: {
      capital_gains: 0.2,
    },
  },
  assets: [
    {
      asset_id: 'cash',
      market_value: 0,
      liquidity_profile: 'cash',
      tax_profile: 'none',
      return_profile: {
        type: 'fixed',
        annual_rate: 0,
      },
    },
    {
      asset_id: 'investment',
      market_value: 0,
      liquidity_profile: 'liquid',
      tax_profile: 'capital_gains',
      return_profile: {
        type: 'fixed',
        annual_rate: 0,
      },
    },
  ],
  transfer_events: [],
  state_transitions: [],
  alert_rules: [],
}

export const toScenario = (values: ScenarioFormValues): Scenario => ({
  assumptions: {
    ...DEFAULT_SCENARIO.assumptions,
    inflation_rate: values.inflationRate,
    simulation_start_month: DEFAULT_SCENARIO.assumptions.simulation_start_month,
  },
  assets: [
    {
      ...DEFAULT_SCENARIO.assets[0],
      market_value: values.initialAssets.cash,
      return_profile: {
        type: 'fixed',
        annual_rate: 0,
      },
    },
    {
      ...DEFAULT_SCENARIO.assets[1],
      market_value: values.initialAssets.investment,
      return_profile: {
        type: 'fixed',
        annual_rate: values.annualReturnRate,
      },
    },
  ],
  transfer_events: [],
  state_transitions: [],
  alert_rules: [],
})
