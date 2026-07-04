import { Scenario, ScenarioFormValues } from './scenario'

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
  assets: values.assets.map((asset) => ({
    ...DEFAULT_SCENARIO.assets.find((defaultAsset) => defaultAsset.asset_id === asset.asset_id),
    ...asset,
  })),
  transfer_events: values.transferEvents ?? [],
  state_transitions: values.stateTransitions ?? [],
  alert_rules: values.alertRules ?? [],
})
