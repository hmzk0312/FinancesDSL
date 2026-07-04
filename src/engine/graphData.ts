import { SimulationResult } from '../domain/simulation'

export type GraphPoint = {
  month: string
  totalAssets: number
}

export type GraphSeries = {
  scenarioId: string
  label: string
  points: GraphPoint[]
}

export type GraphData = {
  series: GraphSeries[]
  xLabels: string[]
  yValues: number[]
  minValue: number
  maxValue: number
}

const buildTicks = (count: number, min: number, max: number) => {
  if (count <= 1) return [min]
  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, index) => Math.round(min + step * index))
}

const buildXLabels = (points: GraphPoint[], tickCount: number) => {
  if (points.length === 0) return []
  if (tickCount <= 1) return [points[0].month]

  // Choose representative labels across the time series for x-axis ticks.
  return Array.from({ length: tickCount }, (_, index) => {
    const position = Math.round((index / (tickCount - 1)) * (points.length - 1))
    return points[position]?.month ?? ''
  })
}

export const buildGraphData = (
  results: SimulationResult[],
  scenarioNames: Record<string, string>,
  tickCount = 5,
): GraphData => {
  const series = results.map((result) => ({
    scenarioId: result.scenarioId,
    label: scenarioNames[result.scenarioId] ?? result.scenarioId,
    points: result.states.map((state) => ({
      month: state.month,
      totalAssets: state.metrics.totalAssets,
    })),
  }))

  const allPoints = series.flatMap((item) => item.points)
  const minValue = allPoints.length > 0 ? Math.min(...allPoints.map((point) => point.totalAssets)) : 0
  const maxValue = allPoints.length > 0 ? Math.max(...allPoints.map((point) => point.totalAssets)) : 0

  const yValues = buildTicks(tickCount, minValue, maxValue)
  const xLabels = series.length > 0 ? buildXLabels(series[0].points, tickCount) : []

  return {
    series,
    xLabels,
    yValues,
    minValue,
    maxValue,
  }
}
