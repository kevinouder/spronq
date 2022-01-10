import { Map, TileLayer } from 'leaflet';

import './style.css'

const mapElm = document.querySelector<HTMLDivElement>('#map')!;

const initMap = () => {
  const map = new Map(mapElm, {
    center: [52.082042, 5.236192],
    zoom: 17,
  });

  const layer = new TileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  );

  map.addLayer(layer);
};

initMap();