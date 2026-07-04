import { ActualObservation } from '../domain/observation';

export const mockObservation: ActualObservation = {
  observedAt: '2026-06-01',
  assets: [
    {
      asset_id: 'cash',
      market_value: 4800000,
    },
    {
      asset_id: 'investment',
      market_value: 11000000,
      cost_basis: 9000000,
    },
  ],
};
