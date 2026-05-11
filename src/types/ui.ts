import type {
  ArmyId,
  CharacterId,
  NationId,
  Position,
  ProvinceId,
} from './common';

export type MapMode =
  | 'political'
  | 'terrain'
  | 'trade'
  | 'religion'
  | 'culture'
  | 'diplomatic'
  | 'development'
  | 'dynasty';

export type DrawerType =
  | 'province'
  | 'nation'
  | 'dynasty'
  | 'diplomacy'
  | 'military'
  | 'economy'
  | 'technology'
  | 'religion'
  | 'politics'
  | 'ideology'
  | 'events'
  | 'save_load';

export type DialogType =
  | 'load_save'
  | 'settings'
  | 'victory'
  | 'pause_menu'
  | 'event'
  | 'archetype_transition'
  | 'ruler_death'
  | 'declare_war';

export interface UIState {
  currentMapMode: MapMode;
  selectedProvinceId: ProvinceId | null;
  selectedNationId: NationId | null;
  selectedCharacterId: CharacterId | null;
  selectedArmyId: ArmyId | null;

  openDrawer: DrawerType | null;
  openDialog: DialogType | null;
  activeEventDialog: string | null;

  showLedger: boolean;
  ledgerTab: string;

  cameraCenter: Position;
  cameraZoom: number;
}
