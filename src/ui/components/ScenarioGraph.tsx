import React from 'react'
import { ActualObservation } from '../../domain/observation'
import { SimulationResult } from '../../domain/simulation'

type Props = {
  results: SimulationResult[]
  observation: ActualObservation
  activeScenarioId?: string
}

const lineColors = ['#2563eb', '#10b981', '#f97316', '#8b5cf6', '#ec4899']

export const ScenarioGraph = ({ results, observation, activeScenarioId }: Props) => {
  const allStates = results.flatMap((result) => result.states)
  if (allStates.length === 0) {
    return <p>No simulation data available.</p>
  }

  const scenarioMax = results.reduce((max, result) => Math.max(max, result.states.length), 0)
  const viewWidth = 760
  const viewHeight = 360
  const padding = 28

  const allValues = allStates.map((state) => state.metrics.totalAssets)
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const range = maxValue - minValue || 1

  const toPoint = (index: number, statesLength: number, value: number) => {
    const x = padding + (index / (statesLength - 1 || 1)) * (viewWidth - padding * 2)
    const y = viewHeight - padding - ((value - minValue) / range) * (viewHeight - padding * 2)
    return { x, y }
  }

  const observedIndex = results[0].states.findIndex((state) => state.month === observation.observedAt)
  const observedX =
    observedIndex >= 0
      ? padding + (observedIndex / (results[0].states.length - 1 || 1)) * (viewWidth - padding * 2)
      : undefined

  return (
    <div>
      <h2>Overlay Graph</h2>
      <div style={styles.summary}>
        <div>
          <div style={styles.summaryLabel}>Latest Total Assets</div>
          <div style={styles.summaryValue}>
            ¥{results[0].states[results[0].states.length - 1].metrics.totalAssets.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={styles.summaryLabel}>Scenarios</div>
          <div style={styles.summaryValue}>{results.length} scenarios</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} style={styles.chart}>
        <rect x="0" y="0" width="100%" height="100%" fill="#f8fafc" rx="18" />

        {results.map((result, index) => {
          const pathData = result.states
            .map((state, stateIndex) => {
              const { x, y } = toPoint(stateIndex, result.states.length, state.metrics.totalAssets)
              return `${stateIndex === 0 ? 'M' : 'L'} ${x} ${y}`
            })
            .join(' ')

          const isActive = result.scenarioId === activeScenarioId
          const color = lineColors[index % lineColors.length]

          return (
            <path
              key={result.scenarioId}
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 4.5 : 2.5}
              strokeOpacity={isActive ? 1 : 0.55}
              strokeLinecap="round"
            />
          )
        })}

        {observedX !== undefined ? (
          <line
            x1={observedX}
            y1={padding}
            x2={observedX}
            y2={viewHeight - padding}
            stroke="#ef4444"
            strokeDasharray="4 4"
          />
        ) : null}
      </svg>
      <div style={styles.legend}>
        {results.map((result, index) => {
          const color = lineColors[index % lineColors.length]
          const isActive = result.scenarioId === activeScenarioId
          return (
            <div key={result.scenarioId} style={styles.legendItem}>
              <span style={{ ...styles.colorDot, backgroundColor: color }} />
              <span style={{ fontWeight: isActive ? 700 : 500 }}>
                {result.scenarioId}{isActive ? ' (active)' : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  chart: {
    width: '100%',
    height: 'auto',
    display: 'block',
    marginTop: '16px',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '12px',
  },
  summaryLabel: {
    fontSize: '0.85rem',
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  legend: {
    display: 'grid',
    gap: '8px',
    marginTop: '12px',
    fontSize: '0.95rem',
    color: '#374151',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  colorDot: {
    width: '12px',
    height: '12px',
    borderRadius: '9999px',
  },
}
