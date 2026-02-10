
export interface PinEnumItemResDTO {
  id: number;
  name: string;
}
export interface PinEnumsResDTO {
  seaBedTypes: PinEnumItemResDTO[];
  speciesTypes: PinEnumItemResDTO[];
  baitTypes: PinEnumItemResDTO[];
  warnPinTypes: PinEnumItemResDTO[];
}

