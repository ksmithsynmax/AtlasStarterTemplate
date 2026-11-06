import type { MapIcon, MapIconSet } from '../../components/map';
import aisDefault from '../../assets/map-icons/theia/ais-default.svg';
import aisHover from '../../assets/map-icons/theia/ais-hover.svg';
import darkDefault from '../../assets/map-icons/theia/dark-default.svg';
import darkHover from '../../assets/map-icons/theia/dark-hover.svg';
import lightDefault from '../../assets/map-icons/theia/light-default.svg';
import lightHover from '../../assets/map-icons/theia/light-hover.svg';
import similarDefault from '../../assets/map-icons/theia/similar-default.svg';
import spoofedPositionDefault from '../../assets/map-icons/theia/spoofed-position-default.svg';
import spoofedPositionHover from '../../assets/map-icons/theia/spoofed-position-hover.svg';
import spoofingShipDefault from '../../assets/map-icons/theia/spoofing-ship-default.svg';
import spoofingShipHover from '../../assets/map-icons/theia/spoofing-ship-hover.svg';
import stsAisDefault from '../../assets/map-icons/theia/sts-ais-default.svg';
import stsAisHover from '../../assets/map-icons/theia/sts-ais-hover.svg';
import stsDefault from '../../assets/map-icons/theia/sts-default.svg';
import stsHover from '../../assets/map-icons/theia/sts-hover.svg';
import unattributedDefault from '../../assets/map-icons/theia/unattributed-default.svg';
import unattributedHover from '../../assets/map-icons/theia/unattributed-hover.svg';
import zombieDefault from '../../assets/map-icons/theia/zombie-default.svg';
import zombieHover from '../../assets/map-icons/theia/zombie-hover.svg';

/** Theia detection types, from the "SynMax Detections" icon sheet in Figma. */
export type TheiaDetectionType =
  | 'ais'
  | 'light'
  | 'dark'
  | 'unattributed'
  | 'spoofedPosition'
  | 'spoofingShip'
  | 'stsAis'
  | 'sts'
  | 'similar'
  | 'zombie';

const hull = (url: string): MapIcon => ({ url, width: 14, height: 22, rotates: true });
const diamond = (url: string): MapIcon => ({ url, width: 21, height: 21 });
const square = (url: string): MapIcon => ({ url, width: 18, height: 18 });

export const theiaIcons: Record<TheiaDetectionType, MapIconSet & { label: string }> = {
  ais: { label: 'AIS', color: '#00EB6C', default: hull(aisDefault), hover: hull(aisHover) },
  light: { label: 'Light', color: '#00A3E3', default: hull(lightDefault), hover: hull(lightHover) },
  dark: { label: 'Dark', color: '#FFA500', default: hull(darkDefault), hover: hull(darkHover) },
  unattributed: {
    label: 'Unattributed',
    color: '#F75349',
    default: hull(unattributedDefault),
    hover: hull(unattributedHover),
  },
  spoofedPosition: {
    label: 'Spoofed position',
    color: '#FF6D99',
    default: diamond(spoofedPositionDefault),
    hover: diamond(spoofedPositionHover),
  },
  spoofingShip: {
    label: 'Spoofing ship',
    color: '#FF6D99',
    default: hull(spoofingShipDefault),
    hover: hull(spoofingShipHover),
  },
  stsAis: { label: 'Ship-to-ship (AIS)', color: '#00EB6C', default: square(stsAisDefault), hover: square(stsAisHover) },
  sts: { label: 'Ship-to-ship', color: '#A78BFA', default: square(stsDefault), hover: square(stsHover) },
  similar: { label: 'Similar ships', color: '#D256FE', default: hull(similarDefault) },
  zombie: { label: 'Zombie ships', color: '#A9A9A9', default: hull(zombieDefault), hover: hull(zombieHover) },
};

const BY_ICON_TYPE: Record<string, TheiaDetectionType> = {
  det_ais: 'ais',
  det_light: 'light',
  det_dark: 'dark',
  det_unattributed: 'unattributed',
  det_spoofed_pos: 'spoofedPosition',
  det_spoofing: 'spoofingShip',
  det_sts: 'sts',
};

const BY_CLASS: Record<string, TheiaDetectionType> = {
  'AIS On': 'light',
  Dark: 'dark',
  Unattributed: 'unattributed',
  Spoofing: 'spoofedPosition',
  STS: 'sts',
};

/** Icon for a Theia detection row, by its `icon_type` and then its `detection_class`. */
export const theiaDetectionType = (row: { icon_type?: string; detection_class?: string }): TheiaDetectionType =>
  BY_ICON_TYPE[row.icon_type ?? ''] ?? BY_CLASS[row.detection_class ?? ''] ?? 'unattributed';
