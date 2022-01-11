import { DomUtil, Icon, LayerGroup, Map, Marker, TileLayer } from 'leaflet';
import mushrooms, {
  Mushroom as MushroomInterface,
  Color,
  Spots,
} from './api/api';
import { generatePopUpHTML, convertEnumToArray, createFilter } from './providers/helpers';

import './style.css';
import 'leaflet/dist/leaflet.css';

//Define globals.
const mapElm = document.querySelector<HTMLDivElement>('#map')!;
const loadingElm = document.querySelector<HTMLDivElement>('#loading-mushrooms')!;
const filtersElm = document.querySelector<HTMLDivElement>('#filters')!;
const colorsFilterElm = document.querySelector<HTMLSelectElement>('#colors')!;
const spotsFilterElm = document.querySelector<HTMLSelectElement>('#spots')!;

let map: Map;
let initializeMushroomData: MushroomInterface[] | never[] = [];
let mushroomData: MushroomInterface[] | never[] = [];
let markerLayer: LayerGroup;

const mushroomIcon = new Icon({
  iconUrl: './src/images/mushroom.svg',
  iconSize: [66, 64], // size of the icon
  popupAnchor: [0, -28], // point from which the popup should open relative to the iconAnchor
});

/**
 * Initialize openstreetmap map.
 *
 * @returns void
 */
const initMap = (): void => {
  map = new Map(mapElm, {
    center: [52.081222, 5.235965],
    zoom: 19,
  });

  const layer = new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  map.addLayer(layer);

  markerLayer = new LayerGroup();
  map.addLayer(markerLayer);
};

/**
 * Add all markers to the map.
 *
 * @return void
 */
const placeMapMarkers = (): void => {
  markerLayer.clearLayers();
  
  mushroomData.forEach((mushroom: MushroomInterface) => {
    const popUpHtml: string = generatePopUpHTML(mushroom);
    const marker: Marker = new Marker(mushroom.latlng, { icon: mushroomIcon })
      .addTo(markerLayer)
      .bindPopup(popUpHtml);

    DomUtil.addClass(
      marker._icon,
      `mushroom-color-${Color[mushroom.color]}`.toLowerCase()
    );
  });
};

/**
 * Get mushroom data from the api.
 *
 * @returns Promise<MushroomInterface[]>
 */
const getMushroomData = async (): Promise<MushroomInterface[]> => {
  return await mushrooms()
    .then((data) => {
      initializeMushroomData = data;
      mushroomData = data;
      loadingElm.classList.add('hidden');
      filtersElm.classList.remove('hidden');
      return data;
    })
    .catch(() => []);
};

/**
 * Filter mushroom data based on filter values.
 * 
 * @returns void
 */
 const filterMushrooms = (): void => {
  mushroomData = initializeMushroomData.filter(
    (mushroom: MushroomInterface) => {
      if (colorsFilterElm.value !== '' && spotsFilterElm.value !== '') {
        return (
          colorsFilterElm.value === mushroom.color.toString() &&
          spotsFilterElm.value === mushroom.spots.toString()
        );
      }

      if (colorsFilterElm.value !== '') {
        return colorsFilterElm.value === mushroom.color.toString();
      }

      if (spotsFilterElm.value !== '') {
        return spotsFilterElm.value === mushroom.spots.toString();
      }

      return true;
    }
  );

  placeMapMarkers();
};

/**
 * Init function.
 *
 * @return void
 */
 const init = async (): Promise<void> => {
  initMap();
  await getMushroomData();
  placeMapMarkers();
  createFilter(colorsFilterElm, convertEnumToArray(Color), filterMushrooms);
  createFilter(spotsFilterElm, convertEnumToArray(Spots), filterMushrooms);
};

init();