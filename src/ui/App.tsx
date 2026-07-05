import React, { useMemo, useState } from 'react';
import { mockScenarios } from '../data/mockScenarios';
import { mockObservation } from '../data/mockObservation';
import { ScenarioEditor } from './components/ScenarioEditor';
import { ScenarioGraph } from './components/ScenarioGraph';
import { useSimulation } from './hooks/useSimulation';
import { Scenario } from '../domain/scenario';

const App = () => {
  const [scenarioForm, setScenarioForm] = useState<Scenario>(mockScenarios[0]);

  const comparisonScenarios = useMemo(
    () =>
      mockScenarios.map((scenario) => (scenario.id === scenarioForm.id ? scenarioForm : scenario)),
    [scenarioForm]
  );

  const scenarioNames = useMemo(
    () => Object.fromEntries(comparisonScenarios.map((scenario) => [scenario.id, scenario.name])),
    [comparisonScenarios]
  );

  const simulationResults = useSimulation(comparisonScenarios, mockObservation, 120);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>Finances DSL MVP</h1>
        <p>オーバーレイグラフとシナリオ編集の 2 ペイン UI</p>
      </header>
      <main style={styles.main}>
        <section style={styles.graphPane}>
          <ScenarioGraph
            results={simulationResults}
            observation={mockObservation}
            activeScenarioId={scenarioForm.id}
            scenarioNames={scenarioNames}
          />
        </section>
        <aside style={styles.editorPane}>
          <ScenarioEditor
            scenarios={mockScenarios}
            value={scenarioForm}
            onChange={setScenarioForm}
          />
        </aside>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#111827',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#fff',
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '24px',
    padding: '24px',
  },
  graphPane: {
    padding: '20px',
    borderRadius: '18px',
    backgroundColor: '#ffffff',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
  },
  editorPane: {
    padding: '20px',
    borderRadius: '18px',
    backgroundColor: '#ffffff',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
  },
};

export default App;
