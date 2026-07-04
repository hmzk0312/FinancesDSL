import { ActualObservation } from '../domain/observation'
import { ScenarioFormValues } from '../domain/scenario'
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

  // Simulate month by month in deterministic order: overlay actual observations, apply cashflow,
  // apply investment return, then compute derived metrics and alerts.
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

    const cash = assets.cash.market_value - scenarioForm.monthlyExpense
    const investment =
      assets.investment.market_value + scenarioForm.monthlyInvestment

    const monthlyReturn = monthlyRate(investmentReturnRate)
    const investmentAfterReturn = investment + investment * monthlyReturn

    assets = {
      ...assets,
      cash: {
        ...assets.cash,
        market_value: cash,
      },
      investment: {
        ...assets.investment,
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
      states: {
        simulation: 'active',
        observation: observation ? 'overlaid' : 'none',
      },
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
