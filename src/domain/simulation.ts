export type AssetState = {
  asset_id: string
  market_value: number
  cost_basis?: number
}

export type Alert = {
  id: string
  target: string
  operator: 'eq' | 'gte' | 'lte'
  value: number
  message: string
  purpose: string
}

export type SimulationState = {
  month: string
  age: {
    years: number
    months: number
  }
  states: Record<string, string>
  assets: Record<string, AssetState>
  metrics: Record<string, number>
  alerts: Alert[]
}

export type SimulationResult = {
  scenarioId: string
  states: SimulationState[]
}
