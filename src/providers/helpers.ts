import { Mushroom as MushroomInterface, Color, Spots } from '../api/api';
import { EnumInterface, OptionInterface } from '../types';

/**
 * Convert TS Enum To Array of Objects.
 *
 * @param e
 * @return OptionInterface[]
 */
export const convertEnumToArray = (e: EnumInterface): OptionInterface[] =>
  Object.values(e)
    .filter((value) => typeof value === 'string')
    .map((label, index) => ({
      label,
      value: index.toString(),
    }));

/**
 * Create html string based on mushroom.
 *
 * @param mushroom
 * @returns string
 */
export const generatePopUpHTML = (mushroom: MushroomInterface): string => {
  let popUpHtml: string = '<ul class="popup-list">';
  popUpHtml += `<li class="capitalize">Name: ${mushroom.name}</li>`;
  popUpHtml += `<li class="capitalize">Spots: ${Spots[mushroom.spots]}</li>`;
  popUpHtml += `<li class="capitalize">Color: ${Color[mushroom.color]}</li>`;
  popUpHtml += '</ul>';

  return popUpHtml;
};

/**
 * Create filter and append it to filtersWrapElm
 *
 * @param filterElm
 * @param options
 * @return void
 */
export const createFilter = (
  filterElm: HTMLSelectElement,
  options: OptionInterface[],
  filterFunc: Function,
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

  // Add on click eventlistener to reset button.
  const buttonElm: HTMLButtonElement | never = filterElm?.nextElementSibling as HTMLButtonElement;
  buttonElm?.addEventListener('click', () => {
    filterElm.value = ''
    filterFunc()
  });

  // Add on change eventlistener.
  filterElm.addEventListener('change', () => filterFunc());
};