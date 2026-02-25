
const WEAPONS = [
  {
    name: "Classic",
    type: "pistol",
    img: "assets/weapons/Classic.png",
    damageBands: [
      { max: 15,  head: 78, body: 26, leg_and_arm: 22 },
      { max: 30,  head: 66, body: 22, leg_and_arm: 18 },
      { max: 999, head: 54, body: 18, leg_and_arm: 15 },
    ],
    fireRate: 6.75,
    magazine: 12,
  },
  {
  name: "Shorty",
  type: "shotgun",
  img: "assets/weapons/Shorty.png",
  damageBands: [
    { max: 10,  head: 144, body: 36, leg_and_arm: 30 },
    { max: 20,  head: 96,  body: 24, leg_and_arm: 20 },
    { max: 25,  head: 48,  body: 12, leg_and_arm: 10 },
  ],
  fireRate: 3.3,
  magazine: 2,
},

  {
    name: "Frenzy",
    type: "pistol",
    img: "assets/weapons/Frenzy.png",
    damageBands: [
      { max: 20,  head: 78, body: 26, leg_and_arm: 22 },
      { max: 30,  head: 63, body: 21, leg_and_arm: 18 },
      { max: 999, head: 51, body: 17, leg_and_arm: 14 },
    ],
    fireRate: 10,
    magazine: 13,
  },
  {
    name: "Ghost",
    type: "pistol",
    img: "assets/weapons/Ghost.png",
    damageBands: [
      { max: 30,  head: 105, body: 30, leg_and_arm: 25 },
      { max: 999, head: 88,  body: 25, leg_and_arm: 21 },
    ],
    fireRate: 6.75,
    magazine: 15,
  },
  {
    name: "Sheriff",
    type: "pistol",
    img: "assets/weapons/Sheriff.png",
    damageBands: [
      { max: 30,  head: 159, body: 55, leg_and_arm: 46 },
      { max: 999, head: 145, body: 50, leg_and_arm: 43 },
    ],
    fireRate: 4,
    magazine: 6,
  },
  {
  name: "Judge",
  type: "shotgun",
  img: "assets/weapons/Judge.png",
  maxRange: 30,
  damageBands: [
    { max: 10,  head: 102, body: 34, leg_and_arm: 28 },
    { max: 20,  head: 60,  body: 20, leg_and_arm: 17 },
    { max: 30, head: 30,  body: 10, leg_and_arm: 9 },
  ],
  fireRate: 3.5,
  magazine: 7,
},
{
  name: "Bucky",
  type: "shotgun",
  img: "assets/weapons/Bucky.png",
  maxRange: 30,
  damageBands: [
    { max: 8,   head: 120, body: 40, leg_and_arm: 34 },
    { max: 16,  head: 78,  body: 26, leg_and_arm: 22 },
    { max: 30, head: 45,  body: 15, leg_and_arm: 13 },
  ],
  fireRate: 1.1,
  magazine: 5,
},

  {
    name: "Stinger",
    type: "smg",
    img: "assets/weapons/Stinger.png",
    damageBands: [
      { max: 20,  head: 67, body: 27, leg_and_arm: 23 },
      { max: 30,  head: 63, body: 25, leg_and_arm: 21 },
      { max: 999, head: 55, body: 22, leg_and_arm: 19 },
    ],
    fireRate: 16,
    magazine: 20,
  },
  {
    name: "Spectre",
    type: "smg",
    img: "assets/weapons/Spectre.png",
    damageBands: [
      { max: 20,  head: 78, body: 26, leg_and_arm: 22 },
      { max: 30,  head: 66, body: 22, leg_and_arm: 18 },
      { max: 999, head: 54, body: 18, leg_and_arm: 15 },
    ],
    fireRate: 13.33,
    magazine: 30,
  },
  {
    name: "Bulldog",
    type: "rifle",
    img: "assets/weapons/Bulldog.png",
    damageBands: [
      { max: 50,  head: 116, body: 35, leg_and_arm: 30 },
      { max: 999, head: 97,  body: 29, leg_and_arm: 25 },
    ],
    fireRate: 9.15,
    magazine: 24,
  },
  {
    name: "Guardian",
    type: "rifle",
    img: "assets/weapons/Guardian.png",
    damageBands: [
      { max: 50,  head: 195, body: 65, leg_and_arm: 55 },
      { max: 999, head: 165, body: 55, leg_and_arm: 47 },
    ],
    fireRate: 5.25,
    magazine: 12,
  },
  {
    name: "Vandal",
    type: "rifle",
    img: "assets/weapons/Vandal.png",
    damageBands: [
      { max: 15,  head: 160, body: 40, leg_and_arm: 34 },
      { max: 30,  head: 140, body: 35, leg_and_arm: 30 },
      { max: 999, head: 120, body: 30, leg_and_arm: 26 },
    ],
    fireRate: 9.75,
    magazine: 30,
  },
  {
    name: "Phantom",
    type: "rifle",
    img: "assets/weapons/Phantom.png",
    damageBands: [
      { max: 15,  head: 156, body: 39, leg_and_arm: 33 },
      { max: 30,  head: 140, body: 35, leg_and_arm: 30 },
      { max: 999, head: 124, body: 31, leg_and_arm: 26 },
    ],
    fireRate: 11,
    magazine: 30,
  },
  {
    name: "Ares",
    type: "lmg",
    img: "assets/weapons/Ares.png",
    damageBands: [
      { max: 30,  head: 90, body: 30, leg_and_arm: 26 },
      { max: 999, head: 84, body: 28, leg_and_arm: 24 },
    ],
    fireRate: 10,
    magazine: 50,
  },
  {
    name: "Odin",
    type: "lmg",
    img: "assets/weapons/Odin.png",
    damageBands: [
      { max: 30,  head: 95, body: 38, leg_and_arm: 32 },
      { max: 999, head: 81, body: 32, leg_and_arm: 27 },
    ],
    fireRate: 12,
    magazine: 100,
  },
  {
    name: "Marshal",
    type: "sniper",
    img: "assets/weapons/Marshal.png",
    damageBands: [
      { max: 999, head: 202, body: 101, leg_and_arm: 85 },
    ],
    fireRate: 1.5,
    magazine: 5,
  },
  {
    name: "Outlaw",
    type: "sniper",
    img: "assets/weapons/Outlaw.png",
    damageBands: [
      { max: 999, head: 238, body: 140, leg_and_arm: 119 },
    ],
    fireRate: 1.4,
    magazine: 2,
  },
  {
    name: "Operator",
    type: "sniper",
    img: "assets/weapons/Operator.png",
    damageBands: [
      { max: 999, head: 255, body: 150, leg_and_arm: 127 },
    ],
    fireRate: 0.75,
    magazine: 5,
  },
];
window.WEAPONS = WEAPONS;
