import { Game } from './game';

export enum FactorioModId {
  SpaceAge = '2x1',
  Paracelsin = 'par',
  Secretas = 'sec',
  TenebrisPrime = 'ten',
  Igrys = 'igr',
  Maraxsis = 'mar',
}

export interface ModInfo {
  /**
   * Do not use the colon (:) character in ID.
   * ID must match the folder name of the mod inside the data folder.
   */
  id: string;
  name: string;
  game: Game;
}
