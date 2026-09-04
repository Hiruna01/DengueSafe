import client from '../../../api/client'

/*
  The scoring parameters — site type weights, the ageing thresholds and
  multipliers, the case window — straight from RiskService.

  The landing page explains how prioritisation works, and this is what lets it
  do that with the real numbers instead of a copy that goes stale the day the
  model is tuned.
*/
export const getRiskModel = () => client.get('/risk-model')
