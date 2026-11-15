/**
 * Curated Apollo archive entries from user-supplied Apollo 11, Apollo 12,
 * Apollo 15 and Surveyor 3 metadata packages (November 2026).
 * Photographs load from external NASA archives; original ZIP binaries are
 * not committed. Scientific files remain listed as provenance only.
 * This module contains no simulated measurement samples.
 */
export type ApolloId = 'apollo11' | 'apollo12' | 'apollo15'
export type ApolloPhoto = { id: string; title: string; description: string; imageUrl: string; sourceUrl: string; archiveFile: string; credit: string }
export type ApolloEvent = { date: string; title: string; body: string }
export type ApolloRecord = {
  label: string; vehicle: string; missionDescription: string; site: string; landing: string
  sourceUrl: string; sourceLabel: string
  events: ApolloEvent[]; notes: { title: string; body: string }[]
  photos: ApolloPhoto[]; science: { instrument: string; dataset: string; description: string; originalFile: string; sourceUrl: string; caveat: string }[]
}
export const APOLLO_ORDER: ApolloId[] = ['apollo11', 'apollo12', 'apollo15']
export const APOLLO_RECORDS: Record<ApolloId, ApolloRecord> = {
  apollo11: {
    label: 'Apollo 11', vehicle: 'Eagle · LM-5', site: 'Sea of Tranquility', landing: 'July 20, 1969 · 20:17:40 UTC',
    missionDescription: 'First crewed lunar landing. Astronauts Neil Armstrong and Buzz Aldrin worked on the surface while Michael Collins remained in lunar orbit.',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C', sourceLabel: 'NASA NSSDCA · Apollo 11 Lunar Module / EASEP',
    events: [
      { date: '1969-07-16', title: 'Launch', body: 'Apollo 11 launched on a Saturn V.' },
      { date: '1969-07-20 20:17:40 UTC', title: 'Eagle lands', body: 'Lunar Module Eagle landed in Mare Tranquillitatis.' },
      { date: '1969-07-21 02:56:15 UTC', title: 'First step', body: 'Neil Armstrong stepped onto the lunar surface.' },
      { date: '1969-07-21 17:54:01 UTC', title: 'Lunar ascent', body: 'The ascent stage of Eagle departed the lunar surface.' },
      { date: '1969-08-27', title: 'EASEP last transmission', body: 'The surface Early Apollo Scientific Experiment Package ended its transmissions.' },
    ],
    notes: [
      { title: 'Two-stage vehicle', body: 'The descent stage remained on the Moon; the ascent stage carried the crew back to lunar orbit. The source does not establish the final fate of the ascent stage.' },
      { title: 'EASEP equipment', body: 'Passive seismic experiment, lunar dust detector and laser ranging retroreflector. The retroreflector was installed separately and did not require power.' },
      { title: 'Lunar site', body: 'Landing coordinates in the supplied NASA NSSDCA record: 0.67416° N, 23.47314° E.' },
    ],
    photos: [
      { id: 'AS11-40-5927', title: 'Experiments removed from Eagle', description: 'Buzz Aldrin removes scientific equipment from the lunar module during the Apollo 11 EVA.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/AS11-40-5927%20(21648739442).jpg?width=1200', sourceUrl: 'https://eol.jsc.nasa.gov/SearchPhotos/photo.pl?mission=AS11&roll=40&frame=5927', archiveFile: 'apollo 11/photos/AS11-40-5927.jfif', credit: 'NASA / Neil Armstrong · AS11-40-5927' },
      { id: 'AS11-40-5948', title: 'Passive seismic deployment', description: 'Apollo 11 crew installing lunar surface experiment equipment.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/AS11-40-5948%20(21881859809).jpg?width=1200', sourceUrl: 'https://history.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11_eva_thumbs.html', archiveFile: 'apollo 11/photos/AS11-40-5948.jfif', credit: 'NASA · AS11-40-5948' },
      { id: 'AS11-40-5921', title: 'Eagle landing hardware', description: 'Documentary surface photograph from the Apollo 11 Hasselblad film magazine.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/AS11-40-5921.jpg?width=1200', sourceUrl: 'https://history.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11_eva_thumbs.html', archiveFile: 'apollo 11/photos/AS11-40-5921.jfif', credit: 'NASA · AS11-40-5921' },
    ],
    science: [
      { instrument: 'Passive Seismic Experiment · MH1 / MH2 / MHZ', dataset: 'PSE station S11 · July 21, 1969', description: 'User-supplied NASA PDS-derived game-ready excerpt: three channels, 404,020 rows per channel, approximately 6.625 Hz sampling. A separate one-minute aggregate and downsampled excerpt are available in the source package. They are raw instrument counts, not calibrated ground velocity or verified moonquake events.', originalFile: 'Apollo11_Game_Ready.zip / manifest.json, minute_summary.csv, excerpts.json', sourceUrl: 'https://pds-geosciences.wustl.edu/lunar/urn-nasa-pds-apollo_pse/data/xa/continuous_waveform/s11/1969/202/', caveat: 'Only a portion of one day of observations. Missing -1 samples are excluded from derived statistics; no event classification or physical-unit calibration.' },
    ],
  },
  apollo12: {
    label: 'Apollo 12', vehicle: 'Intrepid · LM-6', site: 'Oceanus Procellarum', landing: 'November 19, 1969 · 06:54:35 UTC',
    missionDescription: 'Precision crewed lunar landing near the Surveyor 3 robotic lander. Charles Conrad and Alan Bean performed two EVAs and brought selected Surveyor hardware back to Earth.',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C', sourceLabel: 'NASA NSSDCA · Apollo 12 Lunar Module / ALSEP',
    events: [
      { date: '1969-11-14', title: 'Launch', body: 'Apollo 12 launched on Saturn V.' },
      { date: '1969-11-19 06:54:35 UTC', title: 'Intrepid lands', body: 'Lunar Module Intrepid landed in Oceanus Procellarum near Surveyor 3.' },
      { date: '1969-11-19 14:21 UTC', title: 'ALSEP powered on', body: 'The surface scientific central station was activated.' },
      { date: '1969-11-20 14:25:47 UTC', title: 'Ascent', body: 'Intrepid ascent stage launched from the lunar surface.' },
      { date: '1977-09-30', title: 'ALSEP shutdown', body: 'NASA shut down the ALSEP lunar surface experiments.' },
    ],
    notes: [
      { title: 'Surveyor 3 connection', body: 'Surveyor 3 landed in April 1967. Apollo 12 astronauts visited it during their second EVA and returned selected hardware for analysis. Surveyor 3 is a separate robotic mission, not an Apollo flight.' },
      { title: 'Landing site', body: 'NSSDCA coordinates: approximately 3.0128° S, 23.4219° W. Apollo 12 landed approximately 180 m from Surveyor 3.' },
      { title: 'ALSEP instruments', body: 'Surface instrument suite included passive seismometer, lunar dust detector, magnetometer and solar wind spectrometer.' },
    ],
    photos: [
      { id: 'APOLLO12-ANTENNA', title: 'Lunar surface antenna photograph', description: 'A surface communications antenna photographed on the Moon. The original capture ID and Apollo mission attribution have not yet been independently verified.', imageUrl: '/nasa-data/apollo-12/images/apollo12_antenna.jpg', sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C', archiveFile: 'public/nasa-data/apollo-12/images/apollo12_antenna.jpg', credit: 'User-supplied lunar image · attribution pending' },
      { id: 'GPN-2000-001316', title: 'Surveyor 3 hardware visit', description: 'Historical lunar surface photograph showing a crew member beside the Surveyor 3 spacecraft. The image is part of the Apollo 12 mission archive.', imageUrl: '/nasa-data/apollo-12/images/GPN-2000-001316.jpg', sourceUrl: 'https://science.nasa.gov/resource/apollo-12-and-surveyor-3/', archiveFile: 'public/nasa-data/apollo-12/images/GPN-2000-001316.jpg', credit: 'NASA · GPN-2000-001316' },
      { id: 'PIA12903', title: 'Lunar orbital surface detail', description: 'Lunar orbital imagery included in the supplied Apollo 12 source package. Specific mapped features should be interpreted against its original NASA image record.', imageUrl: '/nasa-data/apollo-12/images/PIA12903.jpg', sourceUrl: 'https://science.nasa.gov/mission/lro/', archiveFile: 'public/nasa-data/apollo-12/images/PIA12903.jpg', credit: 'NASA · PIA12903' },
      { id: 'AS12-48-7134', title: 'Surveyor 3 visit', description: 'Apollo 12 crew member examining the Surveyor 3 lander; original image supplied in Surveyor 3 package.', imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/06/as12-48-7134_1280.jpg', sourceUrl: 'https://science.nasa.gov/resource/apollo-12-and-surveyor-3/', archiveFile: 'Surveyor 3/photos/as12-48-7134.jpg', credit: 'NASA · AS12-48-7134' },
      { id: 'AS12-48-7121', title: 'Surveyor 3 in the crater', description: 'Apollo 12 view of the robotic Surveyor 3 spacecraft on the Moon.', imageUrl: 'https://images-assets.nasa.gov/image/as12-48-7121/as12-48-7121~orig.jpg', sourceUrl: 'https://images.nasa.gov/details/as12-48-7121', archiveFile: 'Surveyor 3/photos/as12-48-7121_orig.jpg', credit: 'NASA · AS12-48-7121' },
    ],
    science: [
      { instrument: 'Solar Wind Spectrometer · ALSEP', dataset: 'Apollo 12 SWS one-hour dataset', description: 'Tabular solar wind spectrometer data supplied with a PDS XML label. Raw table is available in the user package; column semantics and units must be read from its XML label before numerical plotting.', originalFile: 'apollo 12/apollo12_sws_1hr_1969c9381.tab + .xml', sourceUrl: 'https://pds-geosciences.wustl.edu/lunar/', caveat: 'No fabricated solar wind graph: original measurements are not deployed as chart-ready data yet.' },
    ],
  },
  apollo15: {
    label: 'Apollo 15', vehicle: 'Falcon · LM-10', site: 'Hadley–Apennine', landing: 'July 30, 1971 · 22:16:29 UTC',
    missionDescription: 'Apollo 15 expanded lunar surface exploration with the first Lunar Roving Vehicle and deployed experiments for examining the lunar environment and interior.',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C', sourceLabel: 'NASA NSSDCA · Apollo 15 Lunar Module / ALSEP',
    events: [
      { date: '1971-07-26', title: 'Launch', body: 'Apollo 15 launched on a Saturn V.' },
      { date: '1971-07-30 22:16:29 UTC', title: 'Falcon lands', body: 'The lunar module landed in the Hadley–Apennine region.' },
      { date: '1971-08-02 17:11:22 UTC', title: 'Moon departure', body: 'Falcon ascent stage departed the lunar surface.' },
      { date: '1971-08-03 03:03:37 UTC', title: 'Ascent stage impact', body: 'The jettisoned ascent stage intentionally impacted the Moon.' },
    ],
    notes: [
      { title: 'First lunar rover', body: 'Apollo 15 used the LRV-1 lunar roving vehicle for surface exploration. The rover was left on the Moon.' },
      { title: 'Heat-flow experiments', body: 'ALSEP heat-flow experiment used two probe datasets in the supplied package. Raw numerical interpretation requires the provided PDS XML labels.' },
      { title: 'Landing site', body: 'NSSDCA coordinates: 26.13239° N, 3.6333° E near the Apennine mountain range.' },
    ],
    photos: [
      { id: 'AS15-85-11471', title: 'Apollo 15 lunar rover', description: 'David Scott at the Lunar Roving Vehicle during Apollo 15 surface operations.', imageUrl: 'https://assets.science.nasa.gov/content/dam/science/psd/lunar-science/2023/09/as15-85-11471_orig.jpg', sourceUrl: 'https://science.nasa.gov/resource/apollo-15-mission-image-view-of-the-apollo-lunar-surface-experiments-package-alsep/', archiveFile: 'apollo15/photos/as15-85-11471_orig.jpg', credit: 'NASA · AS15-85-11471' },
      { id: 'APOLLO15-ROVER', title: 'Loading the rover', description: 'Apollo 15 astronaut and Lunar Roving Vehicle near the lunar module.', imageUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/lunar-science/2023/08/apollo15_rover_1200.jpg', sourceUrl: 'https://science.nasa.gov/resource/loading-the-rover/', archiveFile: 'apollo15/photos/apollo15_rover.jpg', credit: 'NASA · Apollo 15' },
    ],
    science: [
      { instrument: 'Heat Flow Experiment · Probe 1', dataset: 'Apollo 15 HFE probe 1', description: 'Original PDS table and XML label in the supplied archive; measurements require parsing label-defined units and missing values before use in a chart.', originalFile: 'apollo15/probe 1/a15_hfe_p1_1.tab + .xml', sourceUrl: 'https://pds-geosciences.wustl.edu/lunar/', caveat: 'No numerical measurements have been rendered here until the XML schema has been validated.' },
      { instrument: 'Heat Flow Experiment · Probe 2', dataset: 'Apollo 15 HFE probe 2', description: 'Second independent heat-flow probe table and XML label in the supplied archive.', originalFile: 'apollo15/probe 2/a15_hfe_p2_1.tab + .xml', sourceUrl: 'https://pds-geosciences.wustl.edu/lunar/', caveat: 'Probe 2 values must not be mixed with Probe 1; physical units and record validity require PDS label parsing.' },
    ],
  },
}
