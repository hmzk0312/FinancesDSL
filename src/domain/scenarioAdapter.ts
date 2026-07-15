import { Scenario } from './scenario';

export const DEFAULT_SCENARIO: Scenario = {
  id: 'default',
  name: 'Default Scenario',
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
  transferEvents: [],
  stateTransitions: [],
  alertRules: [],
  assumptions: {
    birth_date: '1980-01-01',
    simulation_start_month: '2026-06-01',
    simulation_end_age: 95,
    retirement_age: 65,
    inflation_rate: 0.02,
    monthly_expense: 0,
    monthly_investment: 0,
    tax_rates: {
      capital_gains: 0.2,
    },
  },
};

export const toScenario = (values: Scenario): Scenario => ({
  ...values,
  assumptions: {
    ...DEFAULT_SCENARIO.assumptions,
    ...values.assumptions,
    simulation_start_month: DEFAULT_SCENARIO.assumptions.simulation_start_month,
  },
  assets: values.assets.map((asset) => ({
    ...DEFAULT_SCENARIO.assets.find((defaultAsset) => defaultAsset.asset_id === asset.asset_id),
    ...asset,
  })),
  transferEvents: values.transferEvents ?? [],
  stateTransitions: values.stateTransitions ?? [],
  alertRules: values.alertRules ?? [],
});
