import { ActualObservation } from '../domain/observation'
import { ScenarioFormValues, StateTransition, TransferEvent } from '../domain/scenario'
import { Alert, AssetState, SimulationResult, SimulationState } from '../domain/simulation'
import { toScenario } from '../domain/scenarioAdapter'

const toYearMonthString = (year: number, month: number) => {
  const mm = month.toString().padStart(2, '0')
  return `${year}-${mm}-01`
}

const addMonths = (yearMonth: string, months: number) => {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month - 1 + months, 1)
  return toYearMonthString(date.getFullYear(), date.getMonth() + 1)
}

const getAgeAtMonth = (birthDate: string, yearMonth: string) => {
  const birth = new Date(birthDate)
  const [year, month] = yearMonth.split('-').map(Number)
  let age = year - birth.getFullYear()
  if (month - 1 < birth.getMonth()) {
    age -= 1
  }
  return age
}

// Convert annual return to a fixed monthly rate for simple monthly compounding.
const monthlyRate = (annualRate: number) => annualRate / 12

const getAgeParts = (birthDate: string, yearMonth: string) => {
  const birth = new Date(birthDate)
  const [year, month] = yearMonth.split('-').map(Number)
  let years = year - birth.getFullYear()
  let months = month - (birth.getMonth() + 1)

  if (months < 0) {
    years -= 1
    months += 12
  }

  return {
    years,
    months,
  }
}

const calculateTotalAssets = (assets: Record<string, AssetState>) =>
  assets.cash.market_value + assets.investment.market_value

const buildAlert = (
  id: string,
  target: string,
  operator: Alert['operator'],
  value: number,
  message: string,
  purpose: string,
): Alert => ({ id, target, operator, value, message, purpose })

const generateAlerts = (
  assets: Record<string, AssetState>,
  metrics: Record<string, number>,
): Alert[] => {
  const alerts: Alert[] = []

  if (assets.cash.market_value <= 0) {
    alerts.push(
      buildAlert(
        'negative-cash',
        'cash',
        'lte',
        0,
        'Cash balance is at or below zero.',
        'liquidity',
      ),
    )
  }

  if (metrics.totalAssets <= 0) {
    alerts.push(
      buildAlert(
        'negative-total-assets',
        'totalAssets',
        'lte',
        0,
        'Total assets are at or below zero.',
        'solvency',
      ),
    )
  }

  return alerts
}

const overlayObservation = (
  state: SimulationState,
  observation: ActualObservation | undefined,
) => {
  // Overlay only the observed assets; unobserved assets continue with existing simulated state.
  if (!observation) return state
  const cashAsset = observation.assets.find((asset) => asset.asset_id === 'cash')
  const investmentAsset = observation.assets.find((asset) => asset.asset_id === 'investment')

  const assets = {
    ...state.assets,
    cash: cashAsset
      ? {
          asset_id: 'cash',
          market_value: cashAsset.market_value,
          cost_basis: cashAsset.cost_basis,
        }
      : state.assets.cash,
    investment: investmentAsset
      ? {
          asset_id: 'investment',
          market_value: investmentAsset.market_value,
          cost_basis: investmentAsset.cost_basis,
        }
      : state.assets.investment,
  }

  return {
    ...state,
    assets,
    states: {
      ...state.states,
      observation: 'overlaid',
    },
  }
}

const evaluateCondition = (
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
  },
  currentStates: Record<string, string>,
  age: { years: number; months: number },
  metrics: Record<string, number>,
  assets: Record<string, AssetState>,
) => {
  const matchesAge = () => {
    if (!condition.age) return true
    const { eq, gte, lte } = condition.age
    if (eq !== undefined && age.years !== eq) return false
    if (gte !== undefined && age.years < gte) return false
    if (lte !== undefined && age.years > lte) return false
    return true
  }

  const matchesState = () => {
    if (!condition.state) return true
    return Object.entries(condition.state).every(([key, value]) => currentStates[key] === value)
  }

  const matchesValue = () => {
    if (!condition.value) return true
    const { target, operator, value } = condition.value
    const actual =
      target.type === 'metric'
        ? metrics[target.id]
        : assets[target.id]?.market_value

    if (actual === undefined) return false
    if (operator === 'eq') return actual === value
    if (operator === 'gte') return actual >= value
    return actual <= value
  }

  return matchesAge() && matchesState() && matchesValue()
}

const evaluateConditionForRule = (
  condition: TransferEvent['condition'] | StateTransition['condition'] | undefined,
  currentStates: Record<string, string>,
  age: { years: number; months: number },
  metrics: Record<string, number>,
  assets: Record<string, AssetState>,
) => {
  if (!condition) return true
  return evaluateCondition(condition, currentStates, age, metrics, assets)
}

const applyInflation = (
  value: number,
  monthsFromStart: number,
  inflationRate: number,
) => value * Math.pow(1 + inflationRate, monthsFromStart / 12)

const scheduleMatches = (
  schedule: { type: 'once' | 'monthly' | 'yearly'; month?: string },
  currentMonth: string,
  simulationStartMonth: string,
) => {
  if (schedule.type === 'monthly') return true
  if (schedule.type === 'once') return schedule.month === currentMonth
  if (schedule.type === 'yearly') {
    const currentMonthPart = currentMonth.slice(5, 7)
    if (!schedule.month) {
      return currentMonthPart === simulationStartMonth.slice(5, 7)
    }
    return schedule.month.slice(-2) === currentMonthPart
  }
  return false
}

const applyTransferEvent = (
  assets: Record<string, AssetState>,
  transferEvent: TransferEvent,
  amount: number,
) => {
  const nextAssets = { ...assets }
  if (transferEvent.from !== 'external' && nextAssets[transferEvent.from]) {
    nextAssets[transferEvent.from] = {
      ...nextAssets[transferEvent.from],
      market_value: nextAssets[transferEvent.from].market_value - amount,
    }
  }

  if (transferEvent.to !== 'external' && nextAssets[transferEvent.to]) {
    nextAssets[transferEvent.to] = {
      ...nextAssets[transferEvent.to],
      market_value: nextAssets[transferEvent.to].market_value + amount,
    }
  }

  return nextAssets
}

const findObservation = (
  observations: ActualObservation[],
  yearMonth: string,
) => observations.find((obs) => obs.observedAt === yearMonth)

export const runSimulation = (
  scenarioForm: ScenarioFormValues,
  observations: ActualObservation[],
  months = 120,
): SimulationResult => {
  const scenario = toScenario(scenarioForm)
  const states: SimulationState[] = []

  let currentMonth = scenario.assumptions.simulation_start_month
  let currentAge = getAgeParts(scenario.assumptions.birth_date, currentMonth)

  const initialCash = scenario.assets.find((asset) => asset.asset_id === 'cash')?.market_value ?? 0
  const initialInvestment = scenario.assets.find((asset) => asset.asset_id === 'investment')?.market_value ?? 0

  let assets: Record<string, AssetState> = {
    cash: {
      asset_id: 'cash',
      market_value: initialCash,
    },
    investment: {
      asset_id: 'investment',
      market_value: initialInvestment,
    },
  }

  const investmentReturnRate =
    scenario.assets.find((asset) => asset.asset_id === 'investment')?.return_profile.annual_rate ?? 0

  // Simulate month by month in deterministic order: overlay actual observations, apply state transitions,
  // apply transfer events, then cashflow and investment return, followed by derived metrics and alerts.
  for (let i = 0; i < months; i += 1) {
    const observation = findObservation(observations, currentMonth)
    const overlaidState: SimulationState = overlayObservation(
      {
        month: currentMonth,
        age: currentAge,
        states: {
          simulation: 'running',
          observation: observation ? 'pending' : 'none',
        },
        assets,
        metrics: {},
        alerts: [],
      },
      observation,
    )

    assets = overlaidState.assets

    const currentState: Record<string, string> = {
      ...overlaidState.states,
      observation: observation ? 'overlaid' : 'none',
    }

    if (scenario.state_transitions.length > 0) {
      scenario.state_transitions.forEach((transition) => {
        if (
          evaluateConditionForRule(
            transition.condition,
            currentState,
            currentAge,
            {
              totalAssets: calculateTotalAssets(assets),
              cashBalance: assets.cash.market_value,
              investmentBalance: assets.investment.market_value,
            },
            assets,
          )
        ) {
          currentState.simulation = transition.state
        }
      })
    }

    let nextAssets = assets
    if (scenario.transfer_events.length > 0) {
      scenario.transfer_events.forEach((transferEvent) => {
        if (
          scheduleMatches(transferEvent.schedule, currentMonth, scenario.assumptions.simulation_start_month) &&
          evaluateConditionForRule(
            transferEvent.condition,
            currentState,
            currentAge,
            {
              totalAssets: calculateTotalAssets(nextAssets),
              cashBalance: nextAssets.cash.market_value,
              investmentBalance: nextAssets.investment.market_value,
            },
            nextAssets,
          )
        ) {
          const amountValue =
            transferEvent.amount.type === 'fixed'
              ? transferEvent.amount.value
              : applyInflation(
                  transferEvent.amount.value,
                  i,
                  scenario.assumptions.inflation_rate,
                )
          nextAssets = applyTransferEvent(nextAssets, transferEvent, amountValue)
        }
      })
    }

    const cash = nextAssets.cash.market_value - scenarioForm.monthlyExpense
    const investment = nextAssets.investment.market_value + scenarioForm.monthlyInvestment

    const monthlyReturn = monthlyRate(investmentReturnRate)
    const investmentAfterReturn = investment + investment * monthlyReturn

    assets = {
      ...nextAssets,
      cash: {
        ...nextAssets.cash,
        market_value: cash,
      },
      investment: {
        ...nextAssets.investment,
        market_value: investmentAfterReturn,
      },
    }

    const metrics = {
      totalAssets: calculateTotalAssets(assets),
      cashBalance: assets.cash.market_value,
      investmentBalance: assets.investment.market_value,
      monthlyReturnRate: monthlyReturn,
    }

    const alerts = generateAlerts(assets, metrics)

    states.push({
      month: currentMonth,
      age: currentAge,
      states: currentState,
      assets,
      metrics,
      alerts,
    })

    currentMonth = addMonths(currentMonth, 1)
    currentAge = getAgeParts(scenario.assumptions.birth_date, currentMonth)
  }

  return {
    scenarioId: scenarioForm.id,
    states,
  }
}
