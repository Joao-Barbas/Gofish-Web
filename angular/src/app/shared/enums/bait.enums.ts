// bait.enums.ts

export enum Bait {
  Unknown = 0,
  Worm = 1,
  Shrimp = 2,
  Sardine = 3,
  Squid = 4,
  Mussel = 5,
  Crab = 6,
  LiveFish = 7,
  DeadFish = 8
}

export const BaitLabel: Record<Bait, string> = {
  [Bait.Unknown]: 'Unknown',
  [Bait.Worm]: 'Worm',
  [Bait.Shrimp]: 'Shrimp',
  [Bait.Sardine]: 'Sardine',
  [Bait.Squid]: 'Squid',
  [Bait.Mussel]: 'Mussel',
  [Bait.Crab]: 'Crab',
  [Bait.LiveFish]: 'Live fish',
  [Bait.DeadFish]: 'Dead fish',
};
