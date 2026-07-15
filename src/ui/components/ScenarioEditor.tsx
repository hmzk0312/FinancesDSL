import React from 'react';
import {
  Scenario,
  Assumptions,
  Asset,
  TransferEvent,
  StateTransition,
  AlertRule,
} from '../../domain/scenario';

type Props = {
  scenarios: Scenario[];
  value: Scenario;
  onChange: (value: Scenario) => void;
};

const defaultAsset: Asset = {
  asset_id: '',
  market_value: 0,
  liquidity_profile: 'cash',
  tax_profile: 'none',
  return_profile: { type: 'fixed', annual_rate: 0 },
};

const defaultTransferEvent: TransferEvent = {
  id: '',
  from: 'external',
  to: 'cash',
  amount: { type: 'fixed', value: 0 },
  schedule: { type: 'monthly' },
};

const defaultStateTransition: StateTransition = {
  id: '',
  state: '',
  condition: {
    value: {
      target: { type: 'metric', id: 'total_assets' },
      operator: 'gte',
      value: 0,
    },
  },
};

const defaultAlertRule: AlertRule = {
  id: '',
  condition: {
    value: {
      target: { type: 'metric', id: 'total_assets' },
      operator: 'lte',
      value: 0,
    },
  },
  purpose: 'warning',
  message: '',
};

export const ScenarioEditor = ({ scenarios, value, onChange }: Props) => {
  const updateField = <K extends keyof Scenario>(key: K, nextValue: Scenario[K]) => {
    onChange({ ...value, [key]: nextValue });
  };

  const updateAssets = (nextAssets: Asset[]) => {
    onChange({ ...value, assets: nextAssets });
  };

  const updateTransferEvents = (nextTransferEvents: TransferEvent[]) => {
    onChange({ ...value, transferEvents: nextTransferEvents });
  };

  const updateStateTransitions = (nextStateTransitions: StateTransition[]) => {
    onChange({ ...value, stateTransitions: nextStateTransitions });
  };

  const updateAlertRules = (nextAlertRules: AlertRule[]) => {
    onChange({ ...value, alertRules: nextAlertRules });
  };

  const updateAssumptions = <K extends keyof Assumptions>(key: K, nextValue: Assumptions[K]) => {
    onChange({
      ...value,
      assumptions: {
        ...value.assumptions,
        [key]: nextValue,
      },
    });
  };

  const addAsset = () => updateAssets([...value.assets, { ...defaultAsset }]);
  const addTransferEvent = () =>
    updateTransferEvents([...(value.transferEvents ?? []), { ...defaultTransferEvent }]);
  const addStateTransition = () =>
    updateStateTransitions([...(value.stateTransitions ?? []), { ...defaultStateTransition }]);
  const addAlertRule = () =>
    updateAlertRules([...(value.alertRules ?? []), { ...defaultAlertRule }]);

  return (
    <div>
      <h2>シナリオ編集</h2>
      <div style={styles.field}>
        <label style={styles.label}>ベースシナリオ</label>
        <select
          value={value.id}
          onChange={(event) => {
            const next = scenarios.find((scenario) => scenario.id === event.target.value);
            if (next) onChange(next);
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
        <label style={styles.label}>リタイア年齢</label>
        <input
          type="number"
          value={value.assumptions.retirement_age}
          min={40}
          onChange={(event) => updateAssumptions('retirement_age', Number(event.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>インフレ率</label>
        <input
          type="number"
          step="0.001"
          value={value.assumptions.inflation_rate}
          onChange={(event) => updateAssumptions('inflation_rate', Number(event.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>月次支出</label>
        <input
          type="number"
          value={value.assumptions.monthly_expense}
          onChange={(event) => updateAssumptions('monthly_expense', Number(event.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>月次投資額</label>
        <input
          type="number"
          value={value.assumptions.monthly_investment}
          onChange={(event) => updateAssumptions('monthly_investment', Number(event.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3>Assets</h3>
          <button type="button" onClick={addAsset} style={styles.addButton}>
            + Add Asset
          </button>
        </div>
        {value.assets.map((asset, index) => (
          <div key={`${asset.asset_id}-${index}`} style={styles.card}>
            <div style={styles.gridTwo}>
              <label style={styles.label}>Asset ID</label>
              <input
                type="text"
                value={asset.asset_id}
                onChange={(event) => {
                  const nextAssets = [...value.assets];
                  nextAssets[index] = { ...asset, asset_id: event.target.value };
                  updateAssets(nextAssets);
                }}
                style={styles.input}
              />
            </div>
            <div style={styles.gridTwo}>
              <label style={styles.label}>Market Value</label>
              <input
                type="number"
                value={asset.market_value}
                onChange={(event) => {
                  const nextAssets = [...value.assets];
                  nextAssets[index] = { ...asset, market_value: Number(event.target.value) };
                  updateAssets(nextAssets);
                }}
                style={styles.input}
              />
            </div>
            <div style={styles.gridThree}>
              <div>
                <label style={styles.label}>Liquidity</label>
                <select
                  value={asset.liquidity_profile}
                  onChange={(event) => {
                    const nextAssets = [...value.assets];
                    nextAssets[index] = {
                      ...asset,
                      liquidity_profile: event.target.value as Asset['liquidity_profile'],
                    };
                    updateAssets(nextAssets);
                  }}
                  style={styles.input}
                >
                  <option value="cash">cash</option>
                  <option value="liquid">liquid</option>
                  <option value="restricted">restricted</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Tax Profile</label>
                <select
                  value={asset.tax_profile}
                  onChange={(event) => {
                    const nextAssets = [...value.assets];
                    nextAssets[index] = {
                      ...asset,
                      tax_profile: event.target.value as Asset['tax_profile'],
                    };
                    updateAssets(nextAssets);
                  }}
                  style={styles.input}
                >
                  <option value="none">none</option>
                  <option value="tax_free">tax_free</option>
                  <option value="capital_gains">capital_gains</option>
                  <option value="retirement_income">retirement_income</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Annual Rate</label>
                <input
                  type="number"
                  step="0.001"
                  value={asset.return_profile.annual_rate}
                  onChange={(event) => {
                    const nextAssets = [...value.assets];
                    nextAssets[index] = {
                      ...asset,
                      return_profile: {
                        ...asset.return_profile,
                        annual_rate: Number(event.target.value),
                      },
                    };
                    updateAssets(nextAssets);
                  }}
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3>Transfer Events</h3>
          <button type="button" onClick={addTransferEvent} style={styles.addButton}>
            + Add Transfer
          </button>
        </div>
        {(value.transferEvents ?? []).map((event, index) => (
          <div key={`${event.id}-${index}`} style={styles.card}>
            <div style={styles.gridTwo}>
              <label style={styles.label}>ID</label>
              <input
                type="text"
                value={event.id}
                onChange={(e) => {
                  const next = [...(value.transferEvents ?? [])];
                  next[index] = { ...event, id: e.target.value };
                  updateTransferEvents(next);
                }}
                style={styles.input}
              />
            </div>
            <div style={styles.gridTwo}>
              <label style={styles.label}>From</label>
              <input
                type="text"
                value={event.from}
                onChange={(e) => {
                  const next = [...(value.transferEvents ?? [])];
                  next[index] = { ...event, from: e.target.value };
                  updateTransferEvents(next);
                }}
                style={styles.input}
              />
            </div>
            <div style={styles.gridTwo}>
              <label style={styles.label}>To</label>
              <input
                type="text"
                value={event.to}
                onChange={(e) => {
                  const next = [...(value.transferEvents ?? [])];
                  next[index] = { ...event, to: e.target.value };
                  updateTransferEvents(next);
                }}
                style={styles.input}
              />
            </div>
            <div style={styles.gridThree}>
              <div>
                <label style={styles.label}>Amount</label>
                <input
                  type="number"
                  value={event.amount.value}
                  onChange={(e) => {
                    const next = [...(value.transferEvents ?? [])];
                    next[index] = {
                      ...event,
                      amount: { ...event.amount, value: Number(e.target.value) },
                    };
                    updateTransferEvents(next);
                  }}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Amount Type</label>
                <select
                  value={event.amount.type}
                  onChange={(e) => {
                    const next = [...(value.transferEvents ?? [])];
                    next[index] = {
                      ...event,
                      amount: {
                        ...event.amount,
                        type: e.target.value as TransferEvent['amount']['type'],
                      },
                    };
                    updateTransferEvents(next);
                  }}
                  style={styles.input}
                >
                  <option value="fixed">fixed</option>
                  <option value="inflation_adjusted">inflation_adjusted</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Schedule</label>
                <select
                  value={event.schedule.type}
                  onChange={(e) => {
                    const next = [...(value.transferEvents ?? [])];
                    next[index] = {
                      ...event,
                      schedule: {
                        ...event.schedule,
                        type: e.target.value as TransferEvent['schedule']['type'],
                      },
                    };
                    updateTransferEvents(next);
                  }}
                  style={styles.input}
                >
                  <option value="monthly">monthly</option>
                  <option value="once">once</option>
                  <option value="yearly">yearly</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3>State Transitions</h3>
          <button type="button" onClick={addStateTransition} style={styles.addButton}>
            + Add Transition
          </button>
        </div>
        {(value.stateTransitions ?? []).map((transition, index) => (
          <div key={`${transition.id}-${index}`} style={styles.card}>
            <div style={styles.gridTwo}>
              <label style={styles.label}>ID</label>
              <input
                type="text"
                value={transition.id}
                onChange={(e) => {
                  const next = [...(value.stateTransitions ?? [])];
                  next[index] = { ...transition, id: e.target.value };
                  updateStateTransitions(next);
                }}
                style={styles.input}
              />
            </div>
            <div style={styles.gridTwo}>
              <label style={styles.label}>State</label>
              <input
                type="text"
                value={transition.state}
                onChange={(e) => {
                  const next = [...(value.stateTransitions ?? [])];
                  next[index] = { ...transition, state: e.target.value };
                  updateStateTransitions(next);
                }}
                style={styles.input}
              />
            </div>
            <div style={styles.gridThree}>
              <div>
                <label style={styles.label}>Condition Target</label>
                <input
                  type="text"
                  value={transition.condition.value?.target.id ?? ''}
                  onChange={(e) => {
                    const next = [...(value.stateTransitions ?? [])];
                    next[index] = {
                      ...transition,
                      condition: {
                        ...transition.condition,
                        value: {
                          target: { type: 'metric', id: e.target.value },
                          operator: transition.condition.value?.operator ?? 'gte',
                          value: transition.condition.value?.value ?? 0,
                        },
                      },
                    };
                    updateStateTransitions(next);
                  }}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Operator</label>
                <select
                  value={transition.condition.value?.operator ?? 'gte'}
                  onChange={(e) => {
                    const next = [...(value.stateTransitions ?? [])];
                    next[index] = {
                      ...transition,
                      condition: {
                        ...transition.condition,
                        value: {
                          target: transition.condition.value?.target ?? {
                            type: 'metric',
                            id: 'total_assets',
                          },
                          operator: e.target.value as 'eq' | 'gte' | 'lte',
                          value: transition.condition.value?.value ?? 0,
                        },
                      },
                    };
                    updateStateTransitions(next);
                  }}
                  style={styles.input}
                >
                  <option value="eq">eq</option>
                  <option value="gte">gte</option>
                  <option value="lte">lte</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Value</label>
                <input
                  type="number"
                  value={transition.condition.value?.value ?? 0}
                  onChange={(e) => {
                    const next = [...(value.stateTransitions ?? [])];
                    next[index] = {
                      ...transition,
                      condition: {
                        ...transition.condition,
                        value: {
                          target: transition.condition.value?.target ?? {
                            type: 'metric',
                            id: 'total_assets',
                          },
                          operator: transition.condition.value?.operator ?? 'gte',
                          value: Number(e.target.value),
                        },
                      },
                    };
                    updateStateTransitions(next);
                  }}
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3>Alert Rules</h3>
          <button type="button" onClick={addAlertRule} style={styles.addButton}>
            + Add Alert
          </button>
        </div>
        {(value.alertRules ?? []).map((rule, index) => (
          <div key={`${rule.id}-${index}`} style={styles.card}>
            <div style={styles.gridTwo}>
              <label style={styles.label}>ID</label>
              <input
                type="text"
                value={rule.id}
                onChange={(e) => {
                  const next = [...(value.alertRules ?? [])];
                  next[index] = { ...rule, id: e.target.value };
                  updateAlertRules(next);
                }}
                style={styles.input}
              />
            </div>
            <div style={styles.gridTwo}>
              <label style={styles.label}>Purpose</label>
              <select
                value={rule.purpose}
                onChange={(e) => {
                  const next = [...(value.alertRules ?? [])];
                  next[index] = { ...rule, purpose: e.target.value as AlertRule['purpose'] };
                  updateAlertRules(next);
                }}
                style={styles.input}
              >
                <option value="warning">warning</option>
                <option value="failure_condition">failure_condition</option>
                <option value="success_condition">success_condition</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Message</label>
              <input
                type="text"
                value={rule.message}
                onChange={(e) => {
                  const next = [...(value.alertRules ?? [])];
                  next[index] = { ...rule, message: e.target.value };
                  updateAlertRules(next);
                }}
                style={styles.input}
              />
            </div>
            <div style={styles.gridThree}>
              <div>
                <label style={styles.label}>Target</label>
                <input
                  type="text"
                  value={rule.condition.value?.target.id ?? ''}
                  onChange={(e) => {
                    const next = [...(value.alertRules ?? [])];
                    next[index] = {
                      ...rule,
                      condition: {
                        ...rule.condition,
                        value: {
                          target: { type: 'metric', id: e.target.value },
                          operator: rule.condition.value?.operator ?? 'eq',
                          value: rule.condition.value?.value ?? 0,
                        },
                      },
                    };
                    updateAlertRules(next);
                  }}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Condition Operator</label>
                <select
                  value={rule.condition.value?.operator ?? 'eq'}
                  onChange={(e) => {
                    const next = [...(value.alertRules ?? [])];
                    next[index] = {
                      ...rule,
                      condition: {
                        ...rule.condition,
                        value: {
                          target: rule.condition.value?.target ?? {
                            type: 'metric',
                            id: 'total_assets',
                          },
                          operator: e.target.value as 'eq' | 'gte' | 'lte',
                          value: rule.condition.value?.value ?? 0,
                        },
                      },
                    };
                    updateAlertRules(next);
                  }}
                  style={styles.input}
                >
                  <option value="eq">eq</option>
                  <option value="gte">gte</option>
                  <option value="lte">lte</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Value</label>
                <input
                  type="number"
                  value={rule.condition.value?.value ?? 0}
                  onChange={(e) => {
                    const next = [...(value.alertRules ?? [])];
                    next[index] = {
                      ...rule,
                      condition: {
                        ...rule.condition,
                        value: {
                          target: rule.condition.value?.target ?? {
                            type: 'metric',
                            id: 'total_assets',
                          },
                          operator: rule.condition.value?.operator ?? 'eq',
                          value: Number(e.target.value),
                        },
                      },
                    };
                    updateAlertRules(next);
                  }}
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  addButton: {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    backgroundColor: '#eff6ff',
    cursor: 'pointer',
  },
  card: {
    padding: '16px',
    borderRadius: '14px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    marginBottom: '12px',
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
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
    marginBottom: '12px',
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
    marginBottom: '12px',
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};
