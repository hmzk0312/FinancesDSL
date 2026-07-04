export type AssetObservation = {
  asset_id: string
  market_value: number
  cost_basis?: number
}

export type ActualObservation = {
  observedAt: string
  assets: AssetObservation[]
}
