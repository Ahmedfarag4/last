/** Derived from the user-supplied NASA InSight / EarthScope Marsquake event export.
 * Counts reflect catalogue records (including automatically detected events), NOT
 * exclusively independently located or magnitude-assigned marsquakes.
 * RAD values below are per-group arithmetic means of the 138 supplied calibrated
 * records; groups are Sol 983/991/998 and early/late local time.
 */
export const INSIGHT_MARSQUAKE_STATS = { count: 2715, withMagnitude: 672, from: '2019-01-12', to: '2022-11-19', sourceFile: 'query.txt' } as const
export const INSIGHT_MARSQUAKE_MONTHS = [
'2019-01:2:0','2019-03:2:1','2019-04:3:2','2019-05:10:6','2019-06:77:16','2019-07:120:28','2019-08:115:42','2019-09:35:17','2019-10:92:37','2019-11:114:35','2019-12:162:31',
'2020-01:183:24','2020-02:164:18','2020-03:112:9','2020-04:70:4','2020-05:18:4','2020-06:3:1','2020-07:2:0','2020-09:1:1','2020-10:3:2','2020-11:4:2','2020-12:5:1',
'2021-01:13:5','2021-02:15:7','2021-03:38:7','2021-04:45:8','2021-05:92:28','2021-06:137:33','2021-07:143:39','2021-08:119:32','2021-09:128:45','2021-10:150:56','2021-11:157:48','2021-12:215:43',
'2022-01:39:9','2022-02:83:16','2022-03:33:7','2022-04:4:2','2022-05:5:4','2022-08:1:1','2022-11:1:1',
].map(row => { const [month,total,measured] = row.split(':');return { month,total:Number(total),withMagnitude:Number(measured) } })
export const INSIGHT_LARGEST_EVENTS = [
{ id: 'S1222a', time: '2022-05-04T23:23:07Z', magnitude: 4.6, location: 'Aeolis Northeast', type: 'BROADBAND' },
{ id: 'S0976a', time: '2021-08-25T03:32:20Z', magnitude: 4.3, location: 'Coprates Northwest', type: 'LOW_FREQUENCY' },
{ id: 'S1000a', time: '2021-09-18T17:46:20Z', magnitude: 4.1, location: 'Lunae Palus Northwest', type: 'BROADBAND' },
{ id: 'S0976b', time: '2021-08-25T16:50:18Z', magnitude: 4.1, location: 'Elysium Southwest', type: 'VERY_HIGH_FREQUENCY' },
{ id: 'S1094b', time: '2021-12-24T22:38:02Z', magnitude: 4.0, location: 'Diacria Southwest', type: 'BROADBAND' },
] as const
export const INSIGHT_RAD_GROUPS = [
{ sol: 983, period: 'Early LTST', observations: 23, sensor1A: 132.32, sensor2A: 150.35 },
{ sol: 983, period: 'Later LTST', observations: 23, sensor1A: 277.84, sensor2A: 267.20 },
{ sol: 991, period: 'Early LTST', observations: 23, sensor1A: 143.19, sensor2A: 159.74 },
{ sol: 991, period: 'Later LTST', observations: 23, sensor1A: 279.05, sensor2A: 268.82 },
{ sol: 998, period: 'Early LTST', observations: 23, sensor1A: 142.52, sensor2A: 161.35 },
{ sol: 998, period: 'Later LTST', observations: 23, sensor1A: 278.31, sensor2A: 268.59 },
] as const
export const INSIGHT_RAD_STATS = { count: 138, unit:'K', period:'2021-09-01 to 2021-09-17', sourceFile: 'hp3_rad_cal_00983_20210901_113348.tab.txt', labelFile: 'hp3_rad_cal_00983_20210901_113348.xml' } as const
