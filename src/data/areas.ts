import type { MapArea, Point } from '../api/types';

const rect = (x: number, y: number, w: number, h: number): Point[] => [
  [x, y], [x + w, y], [x + w, y + h], [x, y + h],
];

export const AREAS: MapArea[] = [
  {
    id: 'sector-22',
    name: 'Sector 22',
    city: 'Chandigarh',
    state: 'CH',
    width: 800,
    height: 520,
    roads: [
      { d: 'M0 265 H800', width: 30, label: 'Sector 22 Main Road', labelAt: [600, 269] },
      { d: 'M405 0 V520', width: 30, label: 'Market Road', labelAt: [405, 505] },
      { d: 'M0 510 H800', width: 16 },
    ],
    others: [
      rect(270, 20, 115, 105),
      rect(20, 135, 115, 105), rect(145, 135, 115, 105), rect(270, 135, 115, 105),
      rect(425, 20, 115, 105), rect(550, 20, 115, 105), rect(675, 20, 105, 105),
      rect(550, 135, 115, 105), rect(675, 135, 105, 105),
      rect(20, 290, 55, 100), rect(80, 290, 55, 100), rect(200, 290, 55, 100), rect(260, 290, 55, 100), rect(320, 290, 65, 100),
      rect(570, 290, 95, 130), rect(675, 290, 105, 130),
    ],
    greens: [rect(20, 400, 365, 95), rect(425, 430, 355, 65)],
  },
  {
    id: 'alangudi',
    name: 'Alangudi',
    city: 'Pudukkottai',
    state: 'TN',
    width: 800,
    height: 520,
    roads: [
      { d: 'M0 262 C200 250 420 285 800 252', width: 18, label: 'Alangudi – Pudukkottai Road', labelAt: [640, 262] },
      { d: 'M530 0 C528 90 525 180 520 262', width: 10 },
    ],
    others: [
      [[20, 20], [55, 60], [75, 240], [20, 245]],
      [[670, 40], [780, 30], [780, 230], [660, 235]],
      [[545, 180], [640, 188], [650, 238], [540, 240]],
      [[40, 290], [260, 285], [250, 400], [30, 410]],
      [[280, 290], [470, 295], [480, 380], [270, 390]],
      [[500, 290], [760, 280], [770, 360], [500, 372]],
    ],
    greens: [[[200, 410], [470, 395], [480, 430], [210, 440]]],
    water: [[[0, 450], [180, 430], [400, 460], [620, 420], [800, 440], [800, 520], [0, 520]]],
  },
  {
    id: 'mastipur',
    name: 'Mastipur',
    city: 'Darbhanga',
    state: 'BR',
    width: 800,
    height: 520,
    roads: [
      { d: 'M0 265 H800', width: 26, label: 'Darbhanga – Samastipur Road', labelAt: [620, 269] },
      { d: 'M270 0 V520', width: 14 },
    ],
    others: [
      rect(20, 70, 50, 150),
      [[580, 50], [780, 45], [780, 240], [565, 240]],
      rect(240, 300, 20, 140),
      rect(290, 300, 150, 140), rect(450, 300, 150, 140), rect(610, 300, 170, 140),
      rect(20, 300, 50, 140),
    ],
    greens: [rect(80, 455, 700, 45)],
    water: [[[20, 20], [240, 18], [240, 50], [20, 55]]],
  },
];
