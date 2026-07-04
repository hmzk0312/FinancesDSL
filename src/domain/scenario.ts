export type ScenarioFormValues = {
  id: string
  name: string
  retirementAge: number
  inflationRate: number
  monthlyExpense: number
  monthlyInvestment: number
  assets: Asset[]
  transferEvents?: TransferEvent[]
  stateTransitions?: StateTransition[]
  alertRules?: AlertRule[]
}

export type RateProfile = {
  type: 'fixed'
  annual_rate: number
}

export type Asset = {
  asset_id: string
  market_value: number
  cost_basis?: number
  liquidity_profile: 'cash' | 'liquid' | 'restricted'
  tax_profile: 'none' | 'tax_free' | 'capital_gains' | 'retirement_income'
  return_profile: RateProfile
}

export type TransferEvent = {
  id: string
  from: string
  to: string
  amount: {
    type: 'fixed' | 'inflation_adjusted'
    value: number
  }
  schedule: {
    type: 'once' | 'monthly' | 'yearly'
    month?: string
  }
  condition?: {
    state?: Record<string, string>
    age?: { eq?: number; gte?: number; lte?: number }
    value?: {
      target: {
        type: 'metric' | 'asset'
        id: string
      }
      operator: 'eq' | 'gte' | 'lte'
      value: number
    }
  }
}

export type StateTransition = {
  id: string
  state: string
  condition: {
    state?: Record<string, string>
    age?: { eq?: number; gte?: number; lte?: number }
    value?: {
      target: {
        type: 'metric' | 'asset'
        id: string
      }
      operator: 'eq' | 'gte' | 'lte'
      value: number
    }
  }
}

export type AlertTarget = {
  type: 'metric' | 'asset'
  id: string
}

export type AlertRule = {
  id: string
  target: AlertTarget
  condition: {
    value: {
      target: AlertTarget
      operator: 'eq' | 'gte' | 'lte'
      value: number
    }
  }
  purpose: 'warning' | 'failure_condition' | 'success_condition'
  message: string
}

export type Scenario = {
  assumptions: {
    birth_date: string
    simulation_start_month: string
    simulation_end_age: number
    inflation_rate: number
    tax_rates: {
      capital_gains: number
    }
  }
  assets: Asset[]
  transfer_events: TransferEvent[]
  state_transitions: StateTransition[]
  alert_rules: AlertRule[]
}
