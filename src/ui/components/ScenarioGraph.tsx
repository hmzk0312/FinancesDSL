import React from 'react'
import { ActualObservation } from '../../domain/observation'
import { SimulationResult } from '../../domain/simulation'

type Props = {
  results: SimulationResult[]
  observation: ActualObservation
  activeScenarioId?: string
  scenarioNames: Record<string, string>
}

const lineColors = ['#2563eb', '#10b981', '#f97316', '#8b5cf6', '#ec4899']

export const ScenarioGraph = ({ results, observation, activeScenarioId, scenarioNames }: Props) => {
  const [hiddenScenarios, setHiddenScenarios] = React.useState<Record<string, boolean>>({})

  const displayedResults = results.filter((result) => !hiddenScenarios[result.scenarioId])
  const activeResults = displayedResults.length > 0 ? displayedResults : results
  const allStates = activeResults.flatMap((result) => result.states)
  if (allStates.length === 0) {
    return <p>シミュレーションデータがありません。</p>
  }

  const viewWidth = 760
  const viewHeight = 380
  const padding = 40

  const toggleScenario = (scenarioId: string) => {
    setHiddenScenarios((prev) => ({
      ...prev,
      [scenarioId]: !prev[scenarioId],
    }))
  }

  const allValues = allStates.map((state) => state.metrics.totalAssets)
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const range = maxValue - minValue || 1

  const toPoint = (index: number, statesLength: number, value: number) => {
    const x = padding + (index / (statesLength - 1 || 1)) * (viewWidth - padding * 2)
    const y = viewHeight - padding - ((value - minValue) / range) * (viewHeight - padding * 2)
    return { x, y }
  }

  const xTicks = 5
  const xTickIndexes = Array.from({ length: xTicks }, (_, idx) =>
    Math.floor((idx / (xTicks - 1)) * (results[0].states.length - 1)),
  )

  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks }, (_, idx) =>
    Math.round(minValue + (idx / (yTicks - 1)) * range),
  )

  const observedIndex = results[0].states.findIndex((state) => state.month === observation.observedAt)
  const observedX =
    observedIndex >= 0
      ? padding + (observedIndex / (results[0].states.length - 1 || 1)) * (viewWidth - padding * 2)
      : undefined

  return (
    <div>
      <h2>オーバーレイグラフ</h2>
      <div style={styles.summary}>
        <div>
          <div style={styles.summaryLabel}>最新の総資産</div>
          <div style={styles.summaryValue}>
            ¥{results[0].states[results[0].states.length - 1].metrics.totalAssets.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={styles.summaryLabel}>表示シナリオ</div>
          <div style={styles.summaryValue}>{results.length} 件</div>
        </div>
      </div>

      <div style={styles.chartWrapper}>
        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} style={styles.chart}>
          <rect x="0" y="0" width="100%" height="100%" fill="#f8fafc" rx="18" />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={viewHeight - padding}
            stroke="#d1d5db"
          />
          <line
            x1={padding}
            y1={viewHeight - padding}
            x2={viewWidth - padding}
            y2={viewHeight - padding}
            stroke="#d1d5db"
          />

          {yTickValues.map((value) => {
            const y = viewHeight - padding - ((value - minValue) / range) * (viewHeight - padding * 2)
            return (
              <g key={value}>
                <line x1={padding - 6} y1={y} x2={padding} y2={y} stroke="#9ca3af" />
                <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#374151">
                  ¥{value.toLocaleString()}
                </text>
              </g>
            )
          })}

          {xTickIndexes.map((tickIndex) => {
            const x = padding + (tickIndex / (results[0].states.length - 1 || 1)) * (viewWidth - padding * 2)
            const label = results[0].states[tickIndex]?.month ?? ''
            return (
              <g key={tickIndex}>
                <line x1={x} y1={viewHeight - padding} x2={x} y2={viewHeight - padding + 6} stroke="#9ca3af" />
                <text x={x} y={viewHeight - padding + 20} textAnchor="middle" fontSize="12" fill="#374151">
                  {label.slice(0, 7)}
                </text>
              </g>
            )
          })}

          {results.map((result, index) => {
            if (hiddenScenarios[result.scenarioId]) return null

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
                strokeOpacity={isActive ? 1 : 0.75}
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

          <text x={padding - 10} y={padding - 12} textAnchor="start" fontSize="12" fill="#374151">
            金額 (円)
          </text>
          <text x={viewWidth / 2} y={viewHeight - 6} textAnchor="middle" fontSize="12" fill="#374151">
            月
          </text>
        </svg>
      </div>

      <div style={styles.legend}>
        {results.map((result, index) => {
          const color = lineColors[index % lineColors.length]
          const hidden = hiddenScenarios[result.scenarioId]
          const isActive = result.scenarioId === activeScenarioId
          return (
            <button
              key={result.scenarioId}
              type="button"
              onClick={() => toggleScenario(result.scenarioId)}
              style={{
                ...styles.legendItem,
                opacity: hidden ? 0.35 : 1,
                cursor: 'pointer',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
              }}
            >
              <span style={{ ...styles.colorDot, backgroundColor: color }} />
              <span style={{ fontWeight: isActive ? 700 : 500 }}>
                {scenarioNames[result.scenarioId] ?? result.scenarioId}
              </span>
            </button>
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
