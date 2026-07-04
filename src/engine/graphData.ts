import { SimulationResult } from '../domain/simulation';

export type MetricKey = 'total_assets' | 'cash_total' | 'liquid_assets' | 'after_tax_liquid_assets';

export const metricLabels: Record<MetricKey, string> = {
  total_assets: 'Total Assets',
  cash_total: 'Cash Total',
  liquid_assets: 'Liquid Assets',
  after_tax_liquid_assets: 'After-Tax Liquid Assets',
};

export type GraphPoint = {
  month: string;
  value: number;
};

export type GraphSeries = {
  scenarioId: string;
  label: string;
  points: GraphPoint[];
};

export type AlertMarker = {
  month: string;
  count: number;
  messages: string[];
};

export type GraphData = {
  series: GraphSeries[];
  alertMonths: AlertMarker[];
  xLabels: string[];
  yValues: number[];
  minValue: number;
  maxValue: number;
};

const buildTicks = (count: number, min: number, max: number) => {
  if (count <= 1) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => Math.round(min + step * index));
};

const buildXLabels = (points: GraphPoint[], tickCount: number) => {
  if (points.length === 0) return [];
  if (tickCount <= 1) return [points[0].month];

  // Choose representative labels across the time series for x-axis ticks.
  return Array.from({ length: tickCount }, (_, index) => {
    const position = Math.round((index / (tickCount - 1)) * (points.length - 1));
    return points[position]?.month ?? '';
  });
};

const getMetricValue = (state: SimulationResult['states'][number], metric: MetricKey) =>
  state.metrics[metric] ?? 0;

export const buildGraphData = (
  results: SimulationResult[],
  scenarioNames: Record<string, string>,
  metric: MetricKey = 'total_assets',
  tickCount = 5
): GraphData => {
  const series = results.map((result) => ({
    scenarioId: result.scenarioId,
    label: scenarioNames[result.scenarioId] ?? result.scenarioId,
    points: result.states.map((state) => ({
      month: state.month,
      value: getMetricValue(state, metric),
    })),
  }));

  const allPoints = series.flatMap((item) => item.points);
  const minValue = allPoints.length > 0 ? Math.min(...allPoints.map((point) => point.value)) : 0;
  const maxValue = allPoints.length > 0 ? Math.max(...allPoints.map((point) => point.value)) : 0;

  const alertMonthMap = new Map<string, { count: number; messages: string[] }>();
  results.forEach((result) => {
    result.states.forEach((state) => {
      const messages = state.alerts.map(
        (alert) => `${alert.target.id} ${alert.operator} ${alert.value}: ${alert.message}`
      );
      if (messages.length > 0) {
        const existing = alertMonthMap.get(state.month);
        if (existing) {
          alertMonthMap.set(state.month, {
            count: existing.count + messages.length,
            messages: [...existing.messages, ...messages],
          });
        } else {
          alertMonthMap.set(state.month, { count: messages.length, messages });
        }
      }
    });
  });

  const alertMonths = Array.from(alertMonthMap.entries())
    .map(([month, data]) => ({ month, count: data.count, messages: data.messages }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const yValues = buildTicks(tickCount, minValue, maxValue);
  const xLabels = series.length > 0 ? buildXLabels(series[0].points, tickCount) : [];

  return {
    series,
    alertMonths,
    xLabels,
    yValues,
    minValue,
    maxValue,
  };
};
