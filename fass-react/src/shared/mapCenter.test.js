import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { describe, expect, it } from 'vitest';
import { defaultMapCenter } from './mapCenter.js';

const GREEN_BAY_FALLBACK = [44.519356, -88.019826];
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

describe('defaultMapCenter', () => {
    it('uses the center from the build env', () => {
        expect(defaultMapCenter({ VITE_MAP_CENTER_LAT: '40.0', VITE_MAP_CENTER_LON: '-83.0' })).toEqual([40, -83]);
    });

    it('falls back to Green Bay when the env has no center', () => {
        expect(defaultMapCenter({})).toEqual(GREEN_BAY_FALLBACK);
    });

    it('falls back when either value is missing, empty, or not a number', () => {
        expect(defaultMapCenter({ VITE_MAP_CENTER_LAT: '40.0' })).toEqual(GREEN_BAY_FALLBACK);
        expect(defaultMapCenter({ VITE_MAP_CENTER_LAT: '', VITE_MAP_CENTER_LON: '' })).toEqual(GREEN_BAY_FALLBACK);
        expect(defaultMapCenter({ VITE_MAP_CENTER_LAT: 'north', VITE_MAP_CENTER_LON: '-83.0' })).toEqual(GREEN_BAY_FALLBACK);
    });

    // The prod build (main -> feast pod, fassback) is Franklin County, Ohio and the
    // staging build (staging -> fassfrontstage, fassbackstage) is Brown County,
    // Wisconsin. These match each backend's CENTER_LAT / CENTER_LON.
    it('starts prod builds on Columbus and staging builds on Green Bay', () => {
        expect(defaultMapCenter(loadEnv('production', projectRoot, 'VITE_'))).toEqual([40, -83]);
        expect(defaultMapCenter(loadEnv('staging', projectRoot, 'VITE_'))).toEqual([44.5, -88]);
    });
});
