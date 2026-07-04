import { describe, expect, it } from 'vitest'
import { runSimulation } from './simulationEngine'
import { ScenarioFormValues } from '../domain/scenario'
import { mockObservation } from '../data/mockObservation'
import { ActualObservation } from '../domain/observation'

const baseScenario: ScenarioFormValues = {
  id: 'test-scenario',
  name: 'Test Scenario',
  retirementAge: 60,
  inflationRate: 0.02,
  annualReturnRate: 0.12,
  monthlyExpense: 100000,
  monthlyInvestment: 200000,
  initialAssets: {
    cash: 1000000,
    investment: 5000000,
  },
}

describe('Simulation Engine', () => {
  it('generates the same SimulationResult for the same input', () => {
    const first = runSimulation(baseScenario, [mockObservation], 12)
    const second = runSimulation(baseScenario, [mockObservation], 12)

    expect(second).toEqual(first)
  })

  it('reflects monthly expense and monthly investment in cash and investment balances', () => {
    const result = runSimulation(baseScenario, [], 2)

    expect(result.states[0].assets.cash.market_value).toBe(1000000 - 100000)
    expect(result.states[0].assets.investment.market_value).toBe(
      (5000000 + 200000) * (1 + 0.12 / 12),
    )
    expect(result.states[1].assets.cash.market_value).toBe((1000000 - 100000) - 100000)
  })

  it('converts annual return to monthly return and applies it to investment', () => {
    const result = runSimulation({
      ...baseScenario,
      annualReturnRate: 0.12,
      monthlyExpense: 0,
      monthlyInvestment: 0,
    }, [], 1)

    const expectedInvestment = 5000000 * (1 + 0.12 / 12)
    expect(result.states[0].assets.investment.market_value).toBeCloseTo(expectedInvestment)
  })

  it('changes behavior when retirement age differs only in output metadata', () => {
    const scenario60 = runSimulation({
      ...baseScenario,
      retirementAge: 60,
    }, [], 1)
    const scenario65 = runSimulation({
      ...baseScenario,
      retirementAge: 65,
    }, [], 1)

    expect(scenario60).toEqual(scenario65)
    expect(scenario60.states[0].assets.cash.market_value).toBe(scenario65.states[0].assets.cash.market_value)
  })

  it('calculates total_assets correctly based on cash and investment', () => {
    const result = runSimulation(baseScenario, [], 1)
    const state = result.states[0]
    expect(state.metrics.total_assets).toBe(state.assets.cash.market_value + state.assets.investment.market_value)
  })

  it('applies transfer_events to asset balances before monthly return', () => {
    const scenarioWithTransfer: ScenarioFormValues = {
      ...baseScenario,
      annualReturnRate: 0,
      monthlyExpense: 0,
      monthlyInvestment: 0,
      transferEvents: [
        {
          id: 'cash-to-investment',
          from: 'cash',
          to: 'investment',
          amount: {
            type: 'fixed',
            value: 100000,
          },
          schedule: {
            type: 'monthly',
          },
        },
      ],
    }

    const result = runSimulation(scenarioWithTransfer, [], 1)
    expect(result.states[0].assets.cash.market_value).toBe(900000)
    expect(result.states[0].assets.investment.market_value).toBe(5100000)
  })

  it('applies state_transitions when value condition matches', () => {
    const scenarioWithTransition: ScenarioFormValues = {
      ...baseScenario,
      monthlyExpense: 0,
      monthlyInvestment: 0,
      annualReturnRate: 0,
      stateTransitions: [
        {
          id: 'reach-goal',
          state: 'retired',
          condition: {
            value: {
              target: {
                type: 'metric',
                id: 'total_assets',
              },
              operator: 'gte',
              value: 6000000,
            },
          },
        },
      ],
    }

    const result = runSimulation(scenarioWithTransition, [], 1)
    expect(result.states[0].states.simulation).toBe('retired')
  })

  it('overlays observed asset values and cost basis while preserving unobserved asset state', () => {
    const observation: ActualObservation = {
      observedAt: '2026-06-01',
      assets: [
        {
          asset_id: 'cash',
          market_value: 1234567,
        },
      ],
    }

    const result = runSimulation(
      {
        ...baseScenario,
        monthlyExpense: 0,
        monthlyInvestment: 0,
        annualReturnRate: 0,
      },
      [observation],
      1,
    )

    expect(result.states[0].assets.cash.market_value).toBe(1234567)
    expect(result.states[0].assets.cash.cost_basis).toBeUndefined()
    expect(result.states[0].assets.investment.market_value).toBe(5000000)
  })

  it('throws if ActualObservation contains unknown asset_id', () => {
    const observation: ActualObservation = {
      observedAt: '2026-06-01',
      assets: [
        {
          asset_id: 'unknown_asset',
          market_value: 500000,
        },
      ],
    }

    expect(() => runSimulation(baseScenario, [observation], 1)).toThrow(
      'ActualObservation contains unknown asset_id: unknown_asset',
    )
  })
})
