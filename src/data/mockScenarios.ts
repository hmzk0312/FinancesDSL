import { Scenario } from '../domain/scenario';

export const mockScenarios: Scenario[] = [
  {
    id: 'scenario-1',
    name: 'Base Case',
    assumptions: {
      birth_date: '1980-01-01',
      simulation_start_month: '2026-06-01',
      simulation_end_age: 95,
      retirement_age: 60,
      inflation_rate: 0.02,
      monthly_expense: 300000,
      monthly_investment: 100000,
      tax_rates: {
        capital_gains: 0.2,
      },
    },
    transferEvents: [],
    stateTransitions: [],
    alertRules: [],
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
    assumptions: {
      birth_date: '1980-01-01',
      simulation_start_month: '2026-06-01',
      simulation_end_age: 95,
      retirement_age: 65,
      inflation_rate: 0.03,
      monthly_expense: 320000,
      monthly_investment: 80000,
      tax_rates: {
        capital_gains: 0.2,
      },
    },
    transferEvents: [],
    stateTransitions: [],
    alertRules: [],
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
    assumptions: {
      birth_date: '1980-01-01',
      simulation_start_month: '2026-06-01',
      simulation_end_age: 95,
      retirement_age: 55,
      inflation_rate: 0.015,
      monthly_expense: 280000,
      monthly_investment: 150000,
      tax_rates: {
        capital_gains: 0.2,
      },
    },
    transferEvents: [],
    stateTransitions: [],
    alertRules: [],
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
];
