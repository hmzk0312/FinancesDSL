import { describe, expect, it } from 'vitest';
import { buildGraphData } from './graphData';
import { SimulationResult } from '../domain/simulation';

const sampleResult: SimulationResult = {
  scenarioId: 'scenario-1',
  states: [
    {
      month: '2026-06-01',
      age: { years: 46, months: 5 },
      states: { simulation: 'active', observation: 'none' },
      assets: {
        cash: {
          asset_id: 'cash',
          market_value: 1000000,
          liquidity_profile: 'cash',
          tax_profile: 'none',
        },
        investment: {
          asset_id: 'investment',
          market_value: 2000000,
          liquidity_profile: 'liquid',
          tax_profile: 'capital_gains',
        },
      },
      metrics: {
        total_assets: 3000000,
        cash_total: 1000000,
        liquid_assets: 1000000,
        after_tax_liquid_assets: 1000000,
      },
      alerts: [],
    },
    {
      month: '2026-07-01',
      age: { years: 46, months: 6 },
      states: { simulation: 'active', observation: 'none' },
      assets: {
        cash: {
          asset_id: 'cash',
          market_value: 900000,
          liquidity_profile: 'cash',
          tax_profile: 'none',
        },
        investment: {
          asset_id: 'investment',
          market_value: 2140000,
          liquidity_profile: 'liquid',
          tax_profile: 'capital_gains',
        },
      },
      metrics: {
        total_assets: 3040000,
        cash_total: 900000,
        liquid_assets: 3040000,
        after_tax_liquid_assets: 3040000,
      },
      alerts: [
        {
          id: 'alert-1',
          target: { type: 'metric', id: 'total_assets' },
          operator: 'gte',
          value: 3000000,
          message: 'Test',
          purpose: 'warning',
        },
      ],
    },
  ],
};

describe('GraphData builder', () => {
  it('builds a GraphData object with labels and ticks for the default metric', () => {
    const graphData = buildGraphData(
      [sampleResult],
      { 'scenario-1': 'Test Scenario' },
      'total_assets',
      3
    );

    expect(graphData.series).toHaveLength(1);
    expect(graphData.series[0].label).toBe('Test Scenario');
    expect(graphData.series[0].points).toEqual([
      { month: '2026-06-01', value: 3000000 },
      { month: '2026-07-01', value: 3040000 },
    ]);
    expect(graphData.xLabels).toEqual(['2026-06-01', '2026-07-01', '2026-07-01']);
    expect(graphData.yValues.length).toBe(3);
    expect(graphData.minValue).toBe(3000000);
    expect(graphData.maxValue).toBe(3040000);
    expect(graphData.alertMonths).toEqual([
      {
        month: '2026-07-01',
        count: 1,
        messages: ['total_assets gte 3000000: Test'],
      },
    ]);
  });

  it('builds graph points for a selected alternative metric', () => {
    const graphData = buildGraphData(
      [sampleResult],
      { 'scenario-1': 'Test Scenario' },
      'cash_total',
      3
    );

    expect(graphData.series[0].points).toEqual([
      { month: '2026-06-01', value: 1000000 },
      { month: '2026-07-01', value: 900000 },
    ]);
    expect(graphData.minValue).toBe(900000);
    expect(graphData.maxValue).toBe(1000000);
  });
});
