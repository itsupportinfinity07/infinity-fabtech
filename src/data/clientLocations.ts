export interface ClientLocation {
  id: string;
  city: string;
  state: string;
  /** WGS84 latitude / longitude (approximate town centre) */
  lat: number;
  lng: number;
  clients: string[];
}

export const CLIENT_LOCATIONS: ClientLocation[] = [
  {
    id: "indore",
    city: "Indore",
    state: "Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    clients: [
      "Metal Profile Unit II (2016)",
      "Metal Profile Unit III (2018)",
      "Hi-Tech Metal Forming Unit I (2015)",
      "Hi-Tech Metal Forming Unit II (2016)",
      "Shyam Automotive-I, Indore (2016)",
      "Shyam Automotive-II, Indore (2018)",
      "Flexi Flex, Indore (2015)",
      "Inno Flex & Opal Wear, Indore (2016)",
      "Ajmera Metals, Indore",
      "MB Jigson Hydraulics Pvt. Ltd., Indore",
      "Shreyash Securities Pvt. Ltd. — WC-1 (2015)",
      "Shreyash Securities Pvt. Ltd. — WC-2 (2016)",
      "Shreyash Securities Pvt. Ltd. — WC-3 (2017)",
      "Anant Agro, Indore (2016 & 2018)",
    ],
  },
  {
    id: "pithampur",
    city: "Pithampur",
    state: "Madhya Pradesh",
    lat: 22.6139,
    lng: 75.6972,
    clients: [
      "Bhagirath Coach & Metal Fabricators Pvt. Ltd.",
      "MD Enterprises",
      "DBL Central Warehouse (2019)",
      "Jalpa Devi Engineering Pvt. Ltd. (2019)",
      "Macleods Pharmaceuticals Ltd. — SEZ Unit (2019)",
    ],
  },
  {
    id: "ujjain",
    city: "Ujjain",
    state: "Madhya Pradesh",
    lat: 23.1765,
    lng: 75.7885,
    clients: [
      "Bhagirath Motors, Ujjain",
      "ALIMCO Auxiliary Production Center, Ujjain",
    ],
  },
  {
    id: "ratlam",
    city: "Ratlam",
    state: "Madhya Pradesh",
    lat: 23.3315,
    lng: 75.0367,
    clients: [
      "Katariya Packaging, Ratlam",
      "IPCA, Ratlam",
      "Fortune Stone Limited (I & II), Chatterpur",
    ],
  },
  {
    id: "dewas",
    city: "Dewas",
    state: "Madhya Pradesh",
    lat: 22.9676,
    lng: 76.0534,
    clients: ["Gupta Steel, Dewas"],
  },
  {
    id: "nemawar",
    city: "Nemawar",
    state: "Madhya Pradesh",
    lat: 22.5,
    lng: 76.87,
    clients: [
      "Garg Warehouse, Nemawar",
      "Khandelwal Agrihouse, Nemawar",
      "Shree Salasar Logistics, Nemawar",
      "Master Plast, Nemawar",
      "Natural Grains, Indore",
    ],
  },
  {
    id: "badwah",
    city: "Badwah",
    state: "Madhya Pradesh",
    lat: 22.25,
    lng: 76.03,
    clients: [
      "Associated Alcohol, Unit-I, Badwah (2014)",
      "Associated Alcohol, Unit-II, Badwah (2016)",
      "Associated Alcohol, Unit-III, Badwah (2018)",
    ],
  },
  {
    id: "nimrani",
    city: "Nimrani",
    state: "Madhya Pradesh",
    lat: 22.2,
    lng: 75.683,
    clients: ["Varad Polyfab, Nimrani"],
  },
  {
    id: "rau",
    city: "Rau",
    state: "Madhya Pradesh",
    lat: 22.637,
    lng: 75.81,
    clients: [
      "Rasayan Agro, Rau",
      "Deevin Seismic Systems Pvt. Ltd. (2019)",
    ],
  },
  {
    id: "bhopal",
    city: "Bhopal",
    state: "Madhya Pradesh",
    lat: 23.2599,
    lng: 77.4126,
    clients: ["Commercial Synbag, Pithampur", "Prestige Foods Industries"],
  },
  {
    id: "mundra",
    city: "Mundra",
    state: "Gujarat",
    lat: 22.8394,
    lng: 69.7219,
    clients: [
      "Transworld Terminal Pvt. Ltd. — Mundra",
      "TG Terminal — Mundra",
    ],
  },
  {
    id: "gandhinagar",
    city: "Gandhinagar",
    state: "Gujarat",
    lat: 23.2156,
    lng: 72.6369,
    clients: [
      "Transworld Terminal Pvt. Ltd. (WH-4), Gujarat",
      "TG Terminal, Gujarat",
    ],
  },
  {
    id: "ambala",
    city: "Ambala",
    state: "Haryana",
    lat: 30.3782,
    lng: 76.7767,
    clients: ["Gurudwara, Ambala"],
  },
  {
    id: "amravati",
    city: "Amravati",
    state: "Maharashtra",
    lat: 20.9374,
    lng: 77.7796,
    clients: ["Shyam Indofab (P) Ltd., Amravati"],
  },
  {
    id: "shirdi",
    city: "Shirdi",
    state: "Maharashtra",
    lat: 19.7667,
    lng: 74.4777,
    clients: ["Atma Malik Dhyanpeeth, Shirdi, Shahpur, Nerla"],
  },
  {
    id: "kolkata",
    city: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lng: 88.3639,
    clients: ["Transworld Terminal Pvt. Ltd. — Kolkata"],
  },
  {
    id: "goldstar",
    city: "Sanawad",
    state: "Madhya Pradesh",
    lat: 22.175,
    lng: 76.067,
    clients: [
      "Gold Star Warehouses (WH-I, II, III, IV, V)",
      "Belmaks Metal India Ltd.",
    ],
  },
];
