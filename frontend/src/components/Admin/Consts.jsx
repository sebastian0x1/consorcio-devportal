export const COLOR_LIST = [
  'grey',
  'yellow',
  'olive',
  'green',
  'teal',
  'blue',
  'violet',
  'purple',
  'pink',
  'brown',
  'orange',
  'black',
]

export const COLOR_LIST_ESP = [
  'gris',
  'amarillo',
  'oliva',
  'verde',
  'turquesa',
  'azul',
  'violeta',
  'púrpura',
  'rosa',
  'marrón',
  'naranja',
  'negro',
]

export const COLOR_LIST_SELECT = [
  { value: 0, text: 'gris' },
  { value: 1, text: 'amarillo' },
  { value: 2, text: 'oliva' },
  { value: 3, text: 'verde' },
  { value: 4, text: 'turquesa' },
  { value: 5, text: 'azul' },
  { value: 6, text: 'violeta' },
  { value: 7, text: 'púrpura' },
  { value: 8, text: 'rosa' },
  { value: 9, text: 'marrón' },
  { value: 10, text: 'naranja' },
  { value: 11, text: 'negro' },
]

export const COLOR_LIST_SELECT_ENG = [
  { value: 0, text: 'grey' },
  { value: 1, text: 'yellow' },
  { value: 2, text: 'olive' },
  { value: 3, text: 'green' },
  { value: 4, text: 'teal' },
  { value: 5, text: 'blue' },
  { value: 6, text: 'violet' },
  { value: 7, text: 'purple' },
  { value: 8, text: 'pink' },
  { value: 9, text: 'brown' },
  { value: 10, text: 'orange' },
  { value: 11, text: 'black' },
]

export function traduccionColores(color) {
  const posi = COLOR_LIST.indexOf(color)
  if (posi === -1) return color
  return COLOR_LIST_ESP[posi]
}
