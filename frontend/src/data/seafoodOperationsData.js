// Comprehensive seafood processing plant operations reference

export const SEAFOOD_SPECIES = [
  { id: 'crab', label: 'Crab', hazards: ['shell_punctures', 'heavy_lifting', 'brine_splash'] },
  { id: 'pollock', label: 'Pollock', hazards: ['fillet_knife', 'entanglement', 'wrist_strain'] },
  { id: 'cod', label: 'Cod', hazards: ['fillet_knife', 'entanglement', 'wrist_strain'] },
  { id: 'salmon', label: 'Salmon', hazards: ['slime_slip', 'spine_puncture', 'line_fatigue'] },
  { id: 'whitefish', label: 'Whitefish', hazards: ['fillet_knife', 'slime_slip', 'conveyor_pinch'] },
  { id: 'herring', label: 'Herring', hazards: ['slime_slip', 'spine_puncture', 'fast_line_fatigue'] },
  { id: 'roe', label: 'Roe', hazards: ['slip_eggs', 'repetitive_strain', 'cold_exposure', 'chemical_exposure'] },
  { id: 'other', label: 'Other – Specify', hazards: [] }
];

export const WORK_AREAS = [
  { id: 'processing_floor', label: 'Processing Floor (Wet)', subAreas: ['Fillet Line', 'Roe Room', 'Wet Table'] },
  { id: 'fillet_line', label: 'Fillet Line', hazards: ['knife_cuts', 'slips', 'conveyor_pinch', 'repetitive_strain'] },
  { id: 'roe_room', label: 'Roe Room', hazards: ['slip_eggs', 'repetitive_strain', 'cold_exposure'] },
  { id: 'case_up', label: 'Case-Up / Packing', hazards: ['lifting_strain', 'box_cutter', 'conveyor_pinch', 'wet_slip'] },
  { id: 'packaging', label: 'Packaging', hazards: ['repetitive_strain', 'conveyor_pinch', 'pallet_stack'] },
  { id: 'cannery', label: 'Cannery / Retort Room', hazards: ['steam_burns', 'pressure_hazard', 'can_laceration', 'chemical_exposure'] },
  { id: 'retort', label: 'Retort Room', hazards: ['steam_burns', 'pressure_release', 'hot_surfaces'] },
  { id: 'freezer', label: 'Freezer / Blast Freezer', hazards: ['frostbite', 'cold_stress', 'wet_ppe_fail', 'low_visibility'] },
  { id: 'cold_storage', label: 'Cold Storage', hazards: ['frostbite', 'forklift_traffic', 'visibility'] },
  { id: 'fish_receiving', label: 'Fish Receiving / Dock', hazards: ['heavy_lifting', 'slip_hazards', 'forklift_traffic'] },
  { id: 'boiler_room', label: 'Boiler / Mechanical Room', hazards: ['steam', 'pressure', 'hot_surfaces', 'electrical'] },
  { id: 'maintenance_shop', label: 'Maintenance Shop', hazards: ['mechanical_hazard', 'electrical', 'pinch_points'] },
  { id: 'chemical_storage', label: 'Chemical Storage', hazards: ['chemical_exposure', 'fumes', 'burns'] },
  { id: 'shipping', label: 'Shipping', hazards: ['heavy_lifting', 'forklift_traffic', 'slip_hazards', 'pinch_points'] },
  { id: 'office', label: 'Office', hazards: [] },
  { id: 'other', label: 'Other – Specify', hazards: [] }
];

// Plant office phone numbers for the "Plant Office Number" dropdown
export const PLANT_OFFICE_NUMBERS = [
  'Silver Bay Seafoods – Sitka: 907-747-7996',
  'Silver Bay Seafoods – Craig: 907-826-4550',
  'Silver Bay Seafoods – Ketchikan: 907-225-6664',
  'Silver Bay Seafoods – Petersburg: 907-772-4294',
  'Silver Bay Seafoods – Valdez North: 907-835-8910',
  'Silver Bay Seafoods – Valdez South: 907-835-2076',
  'Silver Bay Seafoods – Cordova: 907-424-7171',
  'Silver Bay Seafoods – Seward: 907-224-3381',
  'Silver Bay Seafoods – False Pass: 907-548-2230',
  'Silver Bay Seafoods – Kodiak East: 907-486-4768',
  'Silver Bay Seafoods – Kodiak West: 907-486-5791',
  'Silver Bay Seafoods – Naknek East: 907-246-3840',
  'Silver Bay Seafoods – Naknek West: 907-246-6860',
  'Silver Bay Seafoods – Dillingham: 907-842-5415',
  'Silver Bay Seafoods – Wood River: 907-842-5415',
];

export const EQUIPMENT_BY_AREA = {
  processing_floor: [
    { id: 'butcher_table', label: 'Butcher Table', area: 'Primary Processing' },
    { id: 'iron', label: 'Iron (Heading Iron)', area: 'Primary Processing' },
    { id: 'baader', label: 'Baader Separator', area: 'Primary Processing' },
    { id: 'marel', label: 'Marel Fillet Machine', area: 'Primary Processing' },
    { id: 'skinner', label: 'Skinner', area: 'Primary Processing' },
    { id: 'portion_cutter', label: 'Portion Cutter', area: 'Primary Processing' },
    { id: 'trimmer_table', label: 'Trimmer Table', area: 'Primary Processing' },
    { id: 'conveyor', label: 'Conveyor Line', area: 'Primary Processing' }
  ],
  fillet_line: [
    { id: 'butcher_table', label: 'Butcher Table', area: 'Fillet Line' },
    { id: 'marel', label: 'Marel Fillet Machine', area: 'Fillet Line' },
    { id: 'trimmer_table', label: 'Trimmer Table', area: 'Fillet Line' },
    { id: 'conveyor', label: 'Conveyor Line', area: 'Fillet Line' }
  ],
  roe_room: [
    { id: 'roe_shaker', label: 'Roe Shaker', area: 'Roe Processing' },
    { id: 'roe_washer', label: 'Roe Washer', area: 'Roe Processing' },
    { id: 'roe_grader', label: 'Roe Grader', area: 'Roe Processing' },
    { id: 'roe_packing_table', label: 'Roe Packing Table', area: 'Roe Processing' }
  ],
  case_up: [
    { id: 'denester', label: 'Denester', area: 'Packaging / Case-Up' },
    { id: 'weigher', label: 'Weigher', area: 'Packaging / Case-Up' },
    { id: 'vacuum_sealer', label: 'Vacuum Sealer', area: 'Packaging / Case-Up' },
    { id: 'bag_sealer', label: 'Bag Sealer', area: 'Packaging / Case-Up' },
    { id: 'case_packer', label: 'Case Packer', area: 'Packaging / Case-Up' },
    { id: 'case_up_table', label: 'Case-Up Table', area: 'Packaging / Case-Up' },
    { id: 'palletizer', label: 'Palletizer', area: 'Packaging / Case-Up' }
  ],
  packaging: [
    { id: 'weigher', label: 'Weigher', area: 'Packaging' },
    { id: 'vacuum_sealer', label: 'Vacuum Sealer', area: 'Packaging' },
    { id: 'bag_sealer', label: 'Bag Sealer', area: 'Packaging' },
    { id: 'labeler', label: 'Labeler', area: 'Packaging' }
  ],
  cannery: [
    { id: 'can_filler', label: 'Can Filler', area: 'Cannery' },
    { id: 'lid_seamer', label: 'Lid Seamer', area: 'Cannery' },
    { id: 'retort', label: 'Retort', area: 'Cannery' },
    { id: 'retort_loader', label: 'Retort Basket Loader', area: 'Cannery' },
    { id: 'can_washer', label: 'Can Washer', area: 'Cannery' },
    { id: 'labeler', label: 'Labeler', area: 'Cannery' }
  ],
  retort: [
    { id: 'retort', label: 'Retort', area: 'Retort Room' },
    { id: 'retort_loader', label: 'Retort Basket Loader', area: 'Retort Room' },
    { id: 'pressure_gauge', label: 'Pressure Monitoring', area: 'Retort Room' }
  ],
  freezer: [
    { id: 'plate_freezer', label: 'Plate Freezer', area: 'Freezer & Cold' },
    { id: 'spiral_freezer', label: 'Spiral Freezer', area: 'Freezer & Cold' },
    { id: 'blast_freezer', label: 'Blast Freezer', area: 'Freezer & Cold' },
    { id: 'glazer', label: 'Glazer', area: 'Freezer & Cold' },
    { id: 'cold_storage_rack', label: 'Cold Storage Rack System', area: 'Freezer & Cold' }
  ],
  cold_storage: [
    { id: 'cold_storage_rack', label: 'Cold Storage Rack System', area: 'Cold Storage' },
    { id: 'forklift', label: 'Forklift', area: 'Cold Storage' }
  ],
  fish_receiving: [
    { id: 'hand_truck', label: 'Hand Truck', area: 'Fish Receiving' },
    { id: 'forklift', label: 'Forklift', area: 'Fish Receiving' },
    { id: 'scale', label: 'Weighing Scale', area: 'Fish Receiving' }
  ],
  boiler_room: [
    { id: 'boiler', label: 'Boiler', area: 'Utilities' },
    { id: 'ammonia_system', label: 'Ammonia System', area: 'Utilities' },
    { id: 'pumps', label: 'Pumps', area: 'Utilities' }
  ],
  maintenance_shop: [
    { id: 'workbench', label: 'Work Bench', area: 'Maintenance' },
    { id: 'power_tools', label: 'Power Tools', area: 'Maintenance' },
    { id: 'hydraulic_press', label: 'Hydraulic Press', area: 'Maintenance' }
  ],
  chemical_storage: [
    { id: 'chemical_tanks', label: 'Chemical Storage Tanks', area: 'Chemical Storage' },
    { id: 'dispensing_station', label: 'Chemical Dispensing Station', area: 'Chemical Storage' }
  ],
  office: [],
  other: []
};

export const HAZARDS_BY_AREA = {
  processing_floor: [
    { id: 'knife_cuts', label: 'Knife Cuts / Punctures', severity: 'high' },
    { id: 'slips', label: 'Slips from Slime, Water, or Brine', severity: 'medium' },
    { id: 'repetitive_strain', label: 'Repetitive Strain Injury', severity: 'medium' },
    { id: 'conveyor_pinch', label: 'Conveyor Pinch Points', severity: 'high' },
    { id: 'entanglement', label: 'Hair/Clothing Entanglement', severity: 'high' }
  ],
  fillet_line: [
    { id: 'knife_cuts', label: 'Knife Cuts / Punctures', severity: 'high' },
    { id: 'slips', label: 'Slips from Slime, Water, or Brine', severity: 'medium' },
    { id: 'repetitive_strain', label: 'Repetitive Strain Injury', severity: 'medium' },
    { id: 'conveyor_pinch', label: 'Conveyor Pinch Points', severity: 'high' },
    { id: 'high_pressure_wash', label: 'High-Pressure Washdown', severity: 'high' }
  ],
  roe_room: [
    { id: 'slip_eggs', label: 'Slip from Eggs / Brine', severity: 'medium' },
    { id: 'repetitive_scoop', label: 'Repetitive Scooping Strain', severity: 'medium' },
    { id: 'cold_exposure', label: 'Cold Exposure', severity: 'medium' },
    { id: 'chemical_exposure', label: 'Sanitation Chemical Exposure', severity: 'high' }
  ],
  case_up: [
    { id: 'lifting_strain', label: 'Repetitive Lifting Strain', severity: 'medium' },
    { id: 'box_cutter', label: 'Box Cutter Lacerations', severity: 'medium' },
    { id: 'conveyor_pinch', label: 'Conveyor Pinch Points', severity: 'high' },
    { id: 'pallet_stack', label: 'Pallet Stacking Injuries', severity: 'high' },
    { id: 'wet_slip', label: 'Slip Hazards from Wet Cartons', severity: 'medium' }
  ],
  packaging: [
    { id: 'repetitive_strain', label: 'Repetitive Strain Injury', severity: 'medium' },
    { id: 'conveyor_pinch', label: 'Conveyor Pinch Points', severity: 'high' },
    { id: 'label_cut', label: 'Labeler Blade Cuts', severity: 'high' },
    { id: 'wet_slip', label: 'Slip Hazards from Wet Surfaces', severity: 'medium' }
  ],
  cannery: [
    { id: 'steam_burns', label: 'Steam / Hot Surface Burns', severity: 'high' },
    { id: 'pressure_hazard', label: 'Retort Pressure Hazards', severity: 'high' },
    { id: 'can_laceration', label: 'Can Edge Lacerations', severity: 'high' },
    { id: 'conveyor_pinch', label: 'Conveyor Pinch Points', severity: 'high' },
    { id: 'chemical_exposure', label: 'Cleaning Chemical Exposure', severity: 'high' }
  ],
  retort: [
    { id: 'steam_burns', label: 'Steam / Hot Surface Burns', severity: 'high' },
    { id: 'pressure_hazard', label: 'Retort Pressure Hazards', severity: 'high' },
    { id: 'pressure_release', label: 'Sudden Pressure Release', severity: 'high' },
    { id: 'hot_surfaces', label: 'Hot Surfaces / Containers', severity: 'high' }
  ],
  freezer: [
    { id: 'frostbite', label: 'Frostbite / Cold Stress', severity: 'high' },
    { id: 'wet_ppe_fail', label: 'Wet PPE Failure', severity: 'high' },
    { id: 'low_visibility', label: 'Low Visibility', severity: 'medium' },
    { id: 'forklift_traffic', label: 'Forklift Traffic', severity: 'high' }
  ],
  cold_storage: [
    { id: 'frostbite', label: 'Frostbite / Cold Stress', severity: 'high' },
    { id: 'forklift_traffic', label: 'Forklift Traffic', severity: 'high' },
    { id: 'low_visibility', label: 'Low Visibility', severity: 'medium' },
    { id: 'iced_surfaces', label: 'Iced/Slippery Surfaces', severity: 'high' }
  ],
  fish_receiving: [
    { id: 'heavy_lifting', label: 'Heavy Lifting / Back Strain', severity: 'high' },
    { id: 'slip_hazards', label: 'Slip Hazards from Ice/Water', severity: 'medium' },
    { id: 'forklift_traffic', label: 'Forklift Traffic', severity: 'high' },
    { id: 'pinch_points', label: 'Loading/Unloading Pinch Points', severity: 'high' }
  ],
  boiler_room: [
    { id: 'steam', label: 'Steam Release / Burns', severity: 'high' },
    { id: 'pressure', label: 'Pressure System Hazards', severity: 'high' },
    { id: 'hot_surfaces', label: 'Hot Surfaces / Equipment', severity: 'high' },
    { id: 'electrical', label: 'Electrical Hazards', severity: 'high' }
  ],
  maintenance_shop: [
    { id: 'mechanical_hazard', label: 'Mechanical Hazards / Rotating Parts', severity: 'high' },
    { id: 'electrical', label: 'Electrical Hazards', severity: 'high' },
    { id: 'pinch_points', label: 'Pinch Points / Crushing Hazards', severity: 'high' },
    { id: 'tool_hazards', label: 'Hand Tool Hazards', severity: 'medium' }
  ],
  chemical_storage: [
    { id: 'chemical_exposure', label: 'Chemical Exposure / Splash', severity: 'high' },
    { id: 'fumes', label: 'Toxic Fumes / Vapors', severity: 'high' },
    { id: 'chemical_burn', label: 'Chemical Burns', severity: 'high' },
    { id: 'incompatible_chemicals', label: 'Incompatible Chemical Reaction', severity: 'high' }
  ],
  office: [],
  other: []
};

export const PPE_MATRIX = {
  knife_work: ['cut_resistant_gloves', 'eye_protection', 'apron', 'steel_toe_boots'],
  wet_processing: ['cut_resistant_gloves', 'eye_protection', 'apron', 'steel_toe_boots', 'slip_resistant_boots'],
  freezer_work: ['cold_weather_protection', 'insulated_gloves', 'anti_slip_boots', 'eye_protection'],
  electrical_work: ['arc_flash_suit', 'insulated_gloves', 'eye_protection', 'hearing_protection'],
  chemical_work: ['respirator', 'chemical_resistant_gloves', 'face_shield', 'apron'],
  high_heat: ['heat_resistant_gloves', 'face_shield', 'apron', 'eye_protection'],
  dock_work: ['high_visibility_vest', 'steel_toe_boots', 'safety_glasses', 'hearing_protection'],
  pneumatic_work: ['eye_protection', 'hearing_protection', 'face_shield']
};

export const PPE_OPTIONS = [
  { id: 'cut_resistant_gloves', label: 'Cut-Resistant Gloves', category: 'Gloves' },
  { id: 'insulated_gloves', label: 'Insulated Gloves', category: 'Gloves' },
  { id: 'chemical_resistant_gloves', label: 'Chemical-Resistant Gloves', category: 'Gloves' },
  { id: 'heat_resistant_gloves', label: 'Heat-Resistant Gloves', category: 'Gloves' },
  { id: 'eye_protection', label: 'Eye Protection / Safety Glasses', category: 'Eyes' },
  { id: 'face_shield', label: 'Face Shield', category: 'Face' },
  { id: 'respirator', label: 'Respirator', category: 'Respiratory' },
  { id: 'hearing_protection', label: 'Hearing Protection / Earplugs', category: 'Ears' },
  { id: 'apron', label: 'Protective Apron', category: 'Body' },
  { id: 'arc_flash_suit', label: 'Arc Flash Suit', category: 'Body' },
  { id: 'cold_weather_protection', label: 'Cold-Weather Jacket/Gear', category: 'Body' },
  { id: 'steel_toe_boots', label: 'Steel-Toe Boots', category: 'Feet' },
  { id: 'slip_resistant_boots', label: 'Slip-Resistant Boots', category: 'Feet' },
  { id: 'anti_slip_boots', label: 'Anti-Slip Boots for Freezers', category: 'Feet' },
  { id: 'high_visibility_vest', label: 'High-Visibility Vest', category: 'Visibility' },
  { id: 'hard_hat', label: 'Hard Hat', category: 'Head' },
  { id: 'other', label: 'Other – Specify', category: 'Other' }
];

export const LOTO_ENERGY_SOURCES = {
  electrical: [
    { id: 'main_disconnect', label: 'Main Disconnect' },
    { id: 'control_circuit', label: 'Control Circuit' },
    { id: 'vfd_panel', label: 'VFD / Motor Control Panel' }
  ],
  pneumatic: [
    { id: 'air_pressure_lines', label: 'Air Pressure Lines' },
    { id: 'receiver_tanks', label: 'Receiver Tanks' },
    { id: 'actuated_valves', label: 'Actuated Valves' }
  ],
  hydraulic: [
    { id: 'hydraulic_lines', label: 'Hydraulic Lines' },
    { id: 'stored_pressure', label: 'Stored Pressure' }
  ],
  thermal: [
    { id: 'retort_steam', label: 'Retort Steam' },
    { id: 'hot_water', label: 'Hot Water Circulation' },
    { id: 'heated_surfaces', label: 'Heated Surfaces' }
  ],
  refrigeration: [
    { id: 'liquid_line_isolation', label: 'Liquid Line Isolation' },
    { id: 'compressor_power', label: 'Compressor Power' },
    { id: 'valve_stations', label: 'Valve Stations' }
  ],
  mechanical: [
    { id: 'springs', label: 'Springs' },
    { id: 'gravity_loads', label: 'Gravity Loads' },
    { id: 'rotating_components', label: 'Rotating Components' }
  ]
};

export const LOCKOUT_DEVICES = [
  { id: 'electrical_lock_tag', label: 'Electrical Lock & Tag' },
  { id: 'valve_lockout', label: 'Valve Lockout' },
  { id: 'group_lock_box', label: 'Group Lock Box' },
  { id: 'plug_lockout', label: 'Plug Lockout' },
  { id: 'chain_block', label: 'Chain / Block' },
  { id: 'other', label: 'Other – Specify' }
];

export const VERIFICATION_METHODS = [
  { id: 'zero_voltage', label: 'Zero Voltage Test' },
  { id: 'pressure_bleed', label: 'Pressure Bleed-Down' },
  { id: 'mechanical_block', label: 'Mechanical Block Verified' },
  { id: 'try_start', label: 'Try-Start Test' },
  { id: 'other', label: 'Other – Specify' }
];

export const JOB_ROLES = [
  { id: 'operator', label: 'Machine Operator' },
  { id: 'maintenance', label: 'Maintenance Technician' },
  { id: 'supervisor', label: 'Supervisor / Lead' },
  { id: 'sanitation', label: 'Sanitation / Cleaning Crew' },
  { id: 'quality', label: 'Quality Control Inspector' },
  { id: 'shipping', label: 'Shipping / Logistics' },
  { id: 'other', label: 'Other – Specify' }
];
