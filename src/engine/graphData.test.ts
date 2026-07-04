import { describe, expect, it } from 'vitest'
import { buildGraphData } from './graphData'
import { SimulationResult } from '../domain/simulation'

const sampleResult: SimulationResult = {
  scenarioId: 'scenario-1',
  states: [
    {
      month: '2026-06-01',
      age: { years: 46, months: 5 },
      states: { simulation: 'active', observation: 'none' },
      assets: {
        cash: { asset_id: 'cash', market_value: 1000000 },
        investment: { asset_id: 'investment', market_value: 2000000 },
      },
      metrics: { totalAssets: 3000000 },
      alerts: [],
    },
    {
      month: '2026-07-01',
      age: { years: 46, months: 6 },
      states: { simulation: 'active', observation: 'none' },
      assets: {
        cash: { asset_id: 'cash', market_value: 900000 },
        investment: { asset_id: 'investment', market_value: 2140000 },
      },
      metrics: { totalAssets: 3040000 },
      alerts: [],
    },
  ],
}

describe('GraphData builder', () => {
  it('builds a GraphData object with labels and ticks', () => {
    const graphData = buildGraphData([sampleResult], { 'scenario-1': 'Test Scenario' }, 3)

    expect(graphData.series).toHaveLength(1)
    expect(graphData.series[0].label).toBe('Test Scenario')
    expect(graphData.series[0].points).toEqual([
      { month: '2026-06-01', totalAssets: 3000000 },
      { month: '2026-07-01', totalAssets: 3040000 },
    ])
    expect(graphData.xLabels).toEqual(['2026-06-01', '2026-07-01', '2026-07-01'])
    expect(graphData.yValues.length).toBe(3)
    expect(graphData.minValue).toBe(3000000)
    expect(graphData.maxValue).toBe(3040000)
  })
})
