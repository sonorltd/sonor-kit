// library-bar-sample.js — invented sample library rows for the <sonor-library-bar> catalogue page + smoke test.
// Shape mirrors a v_sonor_library / device_catalogue row (label, manufacturer, model, service_nn, service_sub, sub_name,
// category, short_code, shape, heightU, ports, powerW, wq_linked). Not real Sonor data.
window.LIBBAR_SAMPLE = [
  // 01 Cinema
  { id: 'cin-spk-lcr', label: 'Screen LCR speaker', manufacturer: 'Triad', model: 'InRoom Gold LCR', service_nn: '01', service_sub: '1', sub_name: 'Speakers', category: 'speaker', short_code: 'LCR', shape: 'circle', ports: 1, wq_linked: true },
  { id: 'cin-spk-sur', label: 'Surround speaker', manufacturer: 'Triad', model: 'InWall Silver', service_nn: '01', service_sub: '1', sub_name: 'Speakers', category: 'speaker', short_code: 'SR', shape: 'circle', ports: 1, wq_linked: true },
  { id: 'cin-spk-atm', label: 'Atmos ceiling speaker', manufacturer: 'Sonance', model: 'VP82R', service_nn: '01', service_sub: '1', sub_name: 'Speakers', category: 'speaker', short_code: 'ATM', shape: 'circle', ports: 1 },
  { id: 'cin-sub', label: 'Subwoofer', manufacturer: 'M&K', model: 'X12+', service_nn: '01', service_sub: '2', sub_name: 'Subwoofers', category: 'subwoofer', short_code: 'SUB', shape: 'square', ports: 1, powerW: 400 },
  { id: 'cin-proc', label: 'AV processor', manufacturer: 'StormAudio', model: 'ISP MK3', service_nn: '01', service_sub: '3', sub_name: 'Processing', category: 'processor', short_code: 'AVP', shape: 'hex', heightU: 2, ports: 8, powerW: 90, wq_linked: true },
  { id: 'cin-amp', label: 'Power amp 16ch', manufacturer: 'NAD', model: 'CI 16-60 DSP', service_nn: '01', service_sub: '3', sub_name: 'Processing', category: 'amplifier', short_code: 'AMP', shape: 'hex', heightU: 2, ports: 8, powerW: 600 },
  { id: 'cin-proj', label: 'Projector', manufacturer: 'JVC', model: 'DLA-NZ900', service_nn: '01', service_sub: '4', sub_name: 'Display', category: 'projector', short_code: 'PJ', shape: 'diamond', ports: 3, powerW: 440, wq_linked: true },
  // 02 Audio
  { id: 'aud-ceil', label: 'Ceiling speaker 6.5"', manufacturer: 'Sonos', model: 'In-Ceiling', service_nn: '02', service_sub: '1', sub_name: 'Speakers', category: 'speaker', short_code: 'SPK', shape: 'circle', ports: 1, wq_linked: true },
  { id: 'aud-amp', label: 'Sonos Amp', manufacturer: 'Sonos', model: 'AMP', service_nn: '02', service_sub: '2', sub_name: 'Amplification', category: 'amplifier', short_code: 'SAMP', shape: 'square', heightU: 1, ports: 4, powerW: 125, wq_linked: true },
  { id: 'aud-amp16', label: 'Multi-zone amp 16ch', manufacturer: 'Triad', model: 'TS-PAMP16-100', service_nn: '02', service_sub: '2', sub_name: 'Amplification', category: 'amplifier', short_code: 'MZA', shape: 'square', heightU: 2, ports: 16, powerW: 800 },
  // 03 Video
  { id: 'vid-tv', label: 'TV point', manufacturer: 'LG', model: 'OLED65G4', service_nn: '03', service_sub: '1', sub_name: 'Displays', category: 'tv', short_code: 'TV', shape: 'pill', ports: 3 },
  { id: 'vid-hdbt', label: 'HDBaseT receiver', manufacturer: 'WyreStorm', model: 'RX-70-4K', service_nn: '03', service_sub: '2', sub_name: 'Distribution', category: 'hdbt', short_code: 'HDB', shape: 'square', ports: 2 },
  { id: 'vid-mtx', label: 'HDMI matrix 8×8', manufacturer: 'WyreStorm', model: 'NHD-MX', service_nn: '03', service_sub: '2', sub_name: 'Distribution', category: 'matrix', short_code: 'MTX', shape: 'square', heightU: 1, ports: 16, powerW: 60 },
  // 04 Lighting
  { id: 'lit-dl', label: 'Downlight', manufacturer: 'Collingwood', model: 'H2 Pro', service_nn: '04', service_sub: '1', sub_name: 'Fittings', category: 'luminaire', short_code: 'DL', shape: 'circle', wq_linked: true },
  { id: 'lit-led', label: 'LED strip run', manufacturer: 'LoL', model: 'COB 24V', service_nn: '04', service_sub: '1', sub_name: 'Fittings', category: 'led', short_code: 'LED', shape: 'pill' },
  { id: 'lit-kp', label: 'Lighting keypad', manufacturer: 'Lutron', model: 'Palladiom', service_nn: '04', service_sub: '2', sub_name: 'Keypads', category: 'keypad', short_code: 'KP', shape: 'square', ports: 1, wq_linked: true },
  { id: 'lit-proc', label: 'Lighting processor', manufacturer: 'Lutron', model: 'QSM', service_nn: '04', service_sub: '3', sub_name: 'Head end', category: 'processor', short_code: 'LP', shape: 'hex', ports: 3 },
  // 05 Automation
  { id: 'aut-blind', label: 'Blind motor', manufacturer: 'Somfy', model: 'Sonesse 40', service_nn: '05', service_sub: '1', sub_name: 'Shading', category: 'motor', short_code: 'BM', shape: 'triangle' },
  { id: 'aut-io', label: 'IO extender', manufacturer: 'Control4', model: 'C4-IOX', service_nn: '05', category: 'io', short_code: 'IO', shape: 'square', heightU: 1, ports: 8 },
  // 06 Climate
  { id: 'clm-stat', label: 'Thermostat', manufacturer: 'Heatmiser', model: 'neoStat V2', service_nn: '06', category: 'thermostat', short_code: 'TH', shape: 'circle' },
  { id: 'clm-hvac', label: 'HVAC interface', manufacturer: 'CoolMaster', model: 'CoolMasterNet', service_nn: '06', category: 'hvac', short_code: 'HVI', shape: 'hex', ports: 2 },
  // 07 Control
  { id: 'ctl-core', label: 'Controller', manufacturer: 'Control4', model: 'CORE 5', service_nn: '07', service_sub: '1', sub_name: 'Head end', category: 'controller', short_code: 'C4', shape: 'hex', heightU: 1, ports: 6, powerW: 18, wq_linked: true },
  { id: 'ctl-tp', label: 'Touchpanel 10"', manufacturer: 'Control4', model: 'T5 10"', service_nn: '07', service_sub: '2', sub_name: 'Interfaces', category: 'touchpanel', short_code: 'TP', shape: 'square', ports: 1 },
  { id: 'ctl-remote', label: 'Halo remote', manufacturer: 'Control4', model: 'Halo Touch', service_nn: '07', service_sub: '2', sub_name: 'Interfaces', category: 'remote', short_code: 'RC', shape: 'pill' },
  // 08 Security
  { id: 'sec-cam', label: 'Bullet camera', manufacturer: 'Hikvision', model: 'DS-2CD2T87', service_nn: '08', service_sub: '1', sub_name: 'CCTV', category: 'camera', short_code: 'CAM', shape: 'triangle', ports: 1, powerW: 12 },
  { id: 'sec-nvr', label: 'NVR 16ch', manufacturer: 'Hikvision', model: 'DS-7616NI-I2', service_nn: '08', service_sub: '1', sub_name: 'CCTV', category: 'nvr', short_code: 'NVR', shape: 'hex', heightU: 2, ports: 17, powerW: 40 },
  { id: 'sec-door', label: 'Door station', manufacturer: '2N', model: 'IP Verso', service_nn: '08', service_sub: '2', sub_name: 'Access', category: 'intercom', short_code: 'DS', shape: 'square', ports: 1 },
  // 09 Network
  { id: 'net-wap', label: 'Ceiling WAP', manufacturer: 'Ubiquiti', model: 'U7 Pro', service_nn: '09', service_sub: '1', sub_name: 'WiFi', category: 'wap', short_code: 'WAP', shape: 'circle', ports: 1, wq_linked: true },
  { id: 'net-sw24', label: 'Switch 24-port PoE', manufacturer: 'Araknis', model: 'AN-310-SW-24-POE', service_nn: '09', service_sub: '2', sub_name: 'Switching', category: 'switch', short_code: 'SW', shape: 'square', heightU: 1, ports: 28, powerW: 370, wq_linked: true },
  { id: 'net-rtr', label: 'Router', manufacturer: 'Araknis', model: 'AN-310-RT-4L2W', service_nn: '09', service_sub: '2', sub_name: 'Switching', category: 'router', short_code: 'RTR', shape: 'square', heightU: 1, ports: 6 },
  { id: 'net-dp', label: 'Data point', service_nn: '09', service_sub: '3', sub_name: 'Outlets', category: 'outlet', short_code: 'DP', shape: 'square' },
  // 10 Infrastructure
  { id: 'str-rack', label: 'Rack 42U', manufacturer: 'Middle Atlantic', model: 'WRK-42', service_nn: '10', service_sub: '1', sub_name: 'Racks', category: 'rack', short_code: 'RK', shape: 'square' },
  { id: 'str-ups', label: 'UPS 1500VA', manufacturer: 'APC', model: 'SMC1500I-2UC', service_nn: '10', service_sub: '2', sub_name: 'Power', category: 'ups', short_code: 'UPS', shape: 'square', heightU: 2, ports: 6, powerW: 900 },
  { id: 'str-pdu', label: 'PDU 8-way', manufacturer: 'Middle Atlantic', model: 'PD-915R', service_nn: '10', service_sub: '2', sub_name: 'Power', category: 'pdu', short_code: 'PDU', shape: 'square', heightU: 1, ports: 9 },
  { id: 'str-patch', label: 'Patch panel 24', service_nn: '10', service_sub: '3', sub_name: 'Patching', category: 'patch', short_code: 'PP', shape: 'square', heightU: 1, ports: 24 }
];
