export type Scenario = {
  id: string;
  name: string;
  assets: Asset[];
  transferEvents: TransferEvent[];
  stateTransitions: StateTransition[];
  alertRules: AlertRule[];
  assumptions: Assumptions;
};

export type Assumptions = {
  birth_date: string;
  simulation_start_month: string;
  simulation_end_age: number;
  retirement_age: number;
  inflation_rate: number;
  monthly_expense: number;
  monthly_investment: number;
  tax_rates: {
    capital_gains: number;
  };
};

export type Asset = {
  asset_id: string;
  market_value: number;
  cost_basis?: number;
  liquidity_profile: 'cash' | 'liquid' | 'restricted';
  tax_profile: 'none' | 'tax_free' | 'capital_gains' | 'retirement_income';
  return_profile: RateProfile;
};

export type RateProfile = {
  type: 'fixed';
  annual_rate: number;
};

export type TransferEvent = {
  id: string;
  from: string;
  to: string;
  amount: {
    type: 'fixed' | 'inflation_adjusted';
    value: number;
  };
  schedule: {
    type: 'once' | 'monthly' | 'yearly';
    month?: string;
  };
  condition?: Condition;
};

export type StateTransition = {
  id: string;
  state: string;
  condition: Condition;
};

export type AlertRule = {
  id: string;
  condition: Condition;
  purpose: 'warning' | 'failure_condition' | 'success_condition';
  message: string;
};

export type Condition = {
  state?: Record<string, string>;
  age?: { eq?: number; gte?: number; lte?: number };
  value?: {
    target: {
      type: 'metric' | 'asset';
      id: string;
    };
    operator: 'eq' | 'gte' | 'lte';
    value: number;
  };
};
