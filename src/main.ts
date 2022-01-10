import { DomUtil, Icon, LayerGroup, Map, Marker, TileLayer } from 'leaflet';
import mushrooms, {
  Mushroom as MushroomInterface,
  Color,
  Spots,
} from './api/api';
import { EnumInterface, OptionInterface } from './types';

import './style.css';
import 'leaflet/dist/leaflet.css';

//Define globals.
const mapElm = document.querySelector<HTMLDivElement>('#map')!;
const loadingElm =
  document.querySelector<HTMLDivElement>('#loading-mushrooms')!;
const filtersElm = document.querySelector<HTMLDivElement>('#filters')!;
const colorsFilterElm = document.querySelector<HTMLSelectElement>('#colors')!;
const spotsFilterElm = document.querySelector<HTMLSelectElement>('#spots')!;

const mushroomIcon = new Icon({
  iconUrl: './src/images/mushroom.svg',
  iconSize: [66, 64], // size of the icon
  popupAnchor: [0, -28], // point from which the popup should open relative to the iconAnchor
});

let map: Map;
let initializeMushroomData: MushroomInterface[] | never[] = [];
let mushroomData: MushroomInterface[] | never[] = [];
let markerLayer: LayerGroup;

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
 * Create html string based on mushroom.
 *
 * @param mushroom
 * @returns string
 */
const generatePopUpHTML = (mushroom: MushroomInterface): string => {
  let popUpHtml: string = '<ul class="popup-list">';
  popUpHtml += `<li class="capitalize">Name: ${mushroom.name}</li>`;
  popUpHtml += `<li class="capitalize">Spots: ${Spots[mushroom.spots]}</li>`;
  popUpHtml += `<li class="capitalize">Color: ${Color[mushroom.color]}</li>`;
  popUpHtml += '</ul>';

  return popUpHtml;
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
 * Create filter and append it to filtersWrapElm
 *
 * @param filterElm
 * @param options
 * @return void
 */
const createFilter = (
  filterElm: HTMLSelectElement,
  options: OptionInterface[]
): void => {
  // Add options to select element.
  options.forEach((object: OptionInterface) => {
    const option: HTMLOptionElement = document.createElement('option');
    option.value = object.value.toString();
    option.label = object.label
      .toLowerCase()
      .replace(/^./, object.label[0].toUpperCase());

    filterElm.add(option);
  });

  const buttonElm: HTMLButtonElement | never = filterElm?.nextElementSibling as HTMLButtonElement;
  buttonElm?.addEventListener('click', () => {
    filterElm.value = ''
    filterMushrooms()
  });

  // Add on change eventlistener.
  filterElm.addEventListener('change', filterMushrooms);
};

/**
 * Convert TS Enum To Array of Objects.
 *
 * @param e
 * @return OptionInterface[]
 */
const convertEnumToArray = (e: EnumInterface): OptionInterface[] =>
  Object.values(e)
    .filter((value) => typeof value === 'string')
    .map((label, index) => ({
      label,
      value: index.toString(),
    }));

/**
 * Init function.
 *
 * @return void
 */
 const init = async (): Promise<void> => {
  initMap();
  await getMushroomData();
  placeMapMarkers();
  createFilter(colorsFilterElm, convertEnumToArray(Color));
  createFilter(spotsFilterElm, convertEnumToArray(Spots));
};

init();