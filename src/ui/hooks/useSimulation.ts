import { useMemo } from 'react'
import { ActualObservation } from '../../domain/observation'
import { ScenarioFormValues } from '../../domain/scenario'
import { SimulationResult } from '../../domain/simulation'
import { runSimulation } from '../../engine/simulationEngine'

export const useSimulation = (
  scenarios: ScenarioFormValues[],
  observation: ActualObservation,
  months = 120,
): SimulationResult[] => {
  return useMemo(
    () => scenarios.map((scenario) => runSimulation(scenario, [observation], months)),
    [scenarios, observation, months],
  )
}
