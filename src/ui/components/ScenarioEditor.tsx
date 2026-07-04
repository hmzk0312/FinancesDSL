import React from 'react'
import { ScenarioFormValues } from '../../domain/scenario'

type Props = {
  scenarios: ScenarioFormValues[]
  value: ScenarioFormValues
  onChange: (value: ScenarioFormValues) => void
}

export const ScenarioEditor = ({ scenarios, value, onChange }: Props) => {
  const updateField = <K extends keyof ScenarioFormValues>(key: K, nextValue: ScenarioFormValues[K]) => {
    onChange({ ...value, [key]: nextValue })
  }

  const updateInitialAsset = (key: 'cash' | 'investment', nextValue: number) => {
    onChange({
      ...value,
      initialAssets: {
        ...value.initialAssets,
        [key]: nextValue,
      },
    })
  }

  return (
    <div>
      <h2>Scenario Editor</h2>
      <div style={styles.field}>
        <label style={styles.label}>Base Scenario</label>
        <select
          value={value.id}
          onChange={(event) => {
            const next = scenarios.find((scenario) => scenario.id === event.target.value)
            if (next) onChange(next)
          }}
          style={styles.select}
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Retirement Age</label>
        <input
          type="number"
          value={value.retirementAge}
          min={40}
          onChange={(event) => updateField('retirementAge', Number(event.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Inflation Rate</label>
        <input
          type="number"
          step="0.001"
          value={value.inflationRate}
          onChange={(event) => updateField('inflationRate', Number(event.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Annual Return Rate</label>
        <input
          type="number"
          step="0.001"
          value={value.annualReturnRate}
          onChange={(event) => updateField('annualReturnRate', Number(event.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Monthly Expense</label>
        <input
          type="number"
          value={value.monthlyExpense}
          onChange={(event) => updateField('monthlyExpense', Number(event.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Monthly Investment</label>
        <input
          type="number"
          value={value.monthlyInvestment}
          onChange={(event) => updateField('monthlyInvestment', Number(event.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.grid}>
        <div style={styles.box}>
          <label style={styles.label}>Initial Cash</label>
          <input
            type="number"
            value={value.initialAssets.cash}
            onChange={(event) => updateInitialAsset('cash', Number(event.target.value))}
            style={styles.input}
          />
        </div>
        <div style={styles.box}>
          <label style={styles.label}>Initial Investment</label>
          <input
            type="number"
            value={value.initialAssets.investment}
            onChange={(event) => updateInitialAsset('investment', Number(event.target.value))}
            style={styles.input}
          />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    backgroundColor: '#ffffff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
}
