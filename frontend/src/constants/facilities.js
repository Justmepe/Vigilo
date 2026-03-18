/**
 * Silver Bay Seafoods Facility Locations
 * Used across all safety forms for facility identification
 */

export const FACILITIES = [
  { code: 'COR', name: 'Cordova' },
  { code: 'CRA', name: 'Craig' },
  { code: 'DHM', name: 'Dillingham' },
  { code: 'FP', name: 'False Pass' },
  { code: 'FPS', name: 'False Pass South' },
  { code: 'KODE', name: 'Kodiak East' },
  { code: 'KODW', name: 'Kodiak West' },
  { code: 'KTN', name: 'Ketchikan' },
  { code: 'MOS', name: 'Moss Landing' },
  { code: 'NAKE', name: 'Naknek East' },
  { code: 'NAKW', name: 'Naknek West' },
  { code: 'PB', name: 'Petersburg' },
  { code: 'SIT', name: 'Sitka' },
  { code: 'SWD', name: 'Seward' },
  { code: 'VAL', name: 'Valdez' },
  { code: 'VCN', name: 'Valdez Cannery' },
  { code: 'WR', name: 'Wood River' },
];

/**
 * Get facility options formatted for select dropdowns
 */
export const getFacilityOptions = () =>
  FACILITIES.map(f => ({
    value: f.code,
    label: `${f.code} - ${f.name}`,
  }));

/**
 * Get facility name by code
 */
export const getFacilityName = (code) => {
  const facility = FACILITIES.find(f => f.code === code);
  return facility ? facility.name : code;
};

/**
 * Get full facility label by code (e.g. "COR - Cordova")
 */
export const getFacilityLabel = (code) => {
  const facility = FACILITIES.find(f => f.code === code);
  return facility ? `${facility.code} - ${facility.name}` : code;
};
