/**
 * uiStore — view state only. Map mode, current selections, open drawer,
 * camera pose. NOT saved to disk; resets at the start of every session.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  ArmyId,
  CharacterId,
  DialogType,
  DrawerType,
  MapMode,
  NationId,
  Position,
  ProvinceId,
  UIState,
} from '@/types';

export interface UIStoreState extends UIState {
  // Map mode
  setMapMode: (mode: MapMode) => void;

  // Selections
  setSelectedProvince: (id: ProvinceId | null) => void;
  setSelectedNation: (id: NationId | null) => void;
  setSelectedCharacter: (id: CharacterId | null) => void;
  setSelectedArmy: (id: ArmyId | null) => void;
  clearSelections: () => void;

  // Drawers / dialogs
  setDrawer: (drawer: DrawerType | null) => void;
  closeDrawer: () => void;
  setDialog: (dialog: DialogType | null) => void;
  closeDialog: () => void;
  setActiveEventDialog: (eventId: string | null) => void;

  // Ledger
  setShowLedger: (open: boolean) => void;
  setLedgerTab: (tab: string) => void;

  // Camera
  setCamera: (center: Position, zoom: number) => void;
  panCamera: (dx: number, dy: number) => void;
  setZoom: (zoom: number) => void;

  // Lifecycle (no save/load — UI never persists)
  initialize: () => void;
}

const INITIAL: UIState = {
  currentMapMode: 'political',
  selectedProvinceId: null,
  selectedNationId: null,
  selectedCharacterId: null,
  selectedArmyId: null,
  openDrawer: null,
  openDialog: null,
  activeEventDialog: null,
  showLedger: false,
  ledgerTab: 'overview',
  cameraCenter: { x: 500, y: 400 },
  cameraZoom: 1,
};

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 5;

function clampZoom(z: number): number {
  if (z < ZOOM_MIN) return ZOOM_MIN;
  if (z > ZOOM_MAX) return ZOOM_MAX;
  return z;
}

export const useUIStore = create<UIStoreState>()(
  devtools(
    subscribeWithSelector((set) => ({
      ...INITIAL,

      setMapMode: (mode) =>
        set(() => ({ currentMapMode: mode }), false, 'ui/setMapMode'),

      setSelectedProvince: (id) =>
        set(
          () => ({ selectedProvinceId: id }),
          false,
          'ui/setSelectedProvince',
        ),
      setSelectedNation: (id) =>
        set(() => ({ selectedNationId: id }), false, 'ui/setSelectedNation'),
      setSelectedCharacter: (id) =>
        set(
          () => ({ selectedCharacterId: id }),
          false,
          'ui/setSelectedCharacter',
        ),
      setSelectedArmy: (id) =>
        set(() => ({ selectedArmyId: id }), false, 'ui/setSelectedArmy'),
      clearSelections: () =>
        set(
          () => ({
            selectedProvinceId: null,
            selectedNationId: null,
            selectedCharacterId: null,
            selectedArmyId: null,
          }),
          false,
          'ui/clearSelections',
        ),

      setDrawer: (drawer) =>
        set(() => ({ openDrawer: drawer }), false, 'ui/setDrawer'),
      closeDrawer: () =>
        set(() => ({ openDrawer: null }), false, 'ui/closeDrawer'),
      setDialog: (dialog) =>
        set(() => ({ openDialog: dialog }), false, 'ui/setDialog'),
      closeDialog: () =>
        set(() => ({ openDialog: null }), false, 'ui/closeDialog'),
      setActiveEventDialog: (eventId) =>
        set(
          () => ({ activeEventDialog: eventId }),
          false,
          'ui/setActiveEventDialog',
        ),

      setShowLedger: (open) =>
        set(() => ({ showLedger: open }), false, 'ui/setShowLedger'),
      setLedgerTab: (tab) =>
        set(() => ({ ledgerTab: tab }), false, 'ui/setLedgerTab'),

      setCamera: (center, zoom) =>
        set(
          () => ({ cameraCenter: { ...center }, cameraZoom: clampZoom(zoom) }),
          false,
          'ui/setCamera',
        ),
      panCamera: (dx, dy) =>
        set(
          (state) => ({
            cameraCenter: {
              x: state.cameraCenter.x + dx,
              y: state.cameraCenter.y + dy,
            },
          }),
          false,
          'ui/panCamera',
        ),
      setZoom: (zoom) =>
        set(
          () => ({ cameraZoom: clampZoom(zoom) }),
          false,
          'ui/setZoom',
        ),

      initialize: () => set(() => ({ ...INITIAL }), false, 'ui/initialize'),
    })),
    { name: 'uiStore' },
  ),
);
