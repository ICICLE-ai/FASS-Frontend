import { client } from './client.js';

export const STAT_KEYS = {
  MEAN_FOOD_SCORE:                         'mean_food_score',
  STDDEV_FOOD_SCORE:                       'stddev_food_score',
  PCT_LOW_FOOD_ACCESS:                     'pct_low_food_access',
  MEAN_DISTANCE_TO_NEAREST_SUPERMARKET:    'mean_distance_to_nearest_supermarket',
  STDDEV_DISTANCE_TO_NEAREST_SUPERMARKET:  'stddev_distance_to_nearest_supermarket',
  MEAN_TRAVEL_TIME_TO_NEAREST_SUPERMARKET: 'mean_travel_time_to_nearest_supermarket',
};

/**
 * Fetch a single reporting stat from the backend.
 *
 * @param {object} params
 * @param {string} params.stat                 - One of the STAT_KEYS values
 * @param {string} params.simulationInstanceId - UUID of the simulation instance
 * @param {number} params.simulationStep       - Step number to query
 *
 * @returns {Promise<{ stat: string, label: string, value: number|null, unit: string }>}
 */
export async function fetchStat({ stat, simulationInstanceId, simulationStep }) {
  const params = new URLSearchParams({
    stat,
    simulation_instance_id: simulationInstanceId,
    simulation_step:        String(simulationStep),
  });

  const response = await client.get('/report/stat?' + params.toString());
  return response.data;
}

/**
 * Fetch all reporting stats from the backend in a single request.
 *
 * @param {object} params
 * @param {string} params.simulationInstanceId - UUID of the simulation instance
 * @param {number} params.simulationStep       - Step number to query
 *
 * @returns {Promise<{ simulation_instance_id: string, simulation_step: number, stats: object }>}
 */
export async function fetchAllStats({ simulationInstanceId, simulationStep }) {
  const params = new URLSearchParams({
    simulation_instance_id: simulationInstanceId,
    simulation_step:        String(simulationStep),
  });

  const response = await client.get('/report/all?' + params.toString());
  return response.data;
}