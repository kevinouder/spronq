import { Map, Marker, TileLayer } from 'leaflet';
import mushrooms, { Mushroom as MushroomInterface } from './api/api';

import './style.css'
import 'leaflet/dist/leaflet.css';

//Define globals.
const mapElm = document.querySelector<HTMLDivElement>('#map')!;
let map: Map;
let mushroomData: MushroomInterface[] | never[] = [];

/**
 * Initialize openstreetmap map.
 * 
 * @returns void
 */
const initMap = (): void => {
  map = new Map(mapElm, {
    center: [52.082042, 5.236192],
    zoom: 17,
  });

  const layer = new TileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  );

  map.addLayer(layer);
};

/**
 * Add all markers to the map.
 *
 * @return void
 */
 const placeMapMarkers = (): void => {
  mushroomData.forEach((mushroom: MushroomInterface) => {
    new Marker(mushroom.latlng)
      .addTo(map)
      .bindPopup(mushroom.name);
  });
};

/**
 * Get mushroom data from the api.
 *
 * @returns Promise<MushroomInterface[]>
 */
 const getMushroomData = async (): Promise<MushroomInterface[]> => {
  return await mushrooms()
    .then((data) => mushroomData = data)
    .catch(() => []);
};

initMap();
await getMushroomData();
placeMapMarkers();