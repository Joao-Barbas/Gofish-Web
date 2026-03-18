import { Component, input } from '@angular/core';
import { Path, PathSegment } from '@gofish/shared/constants';

@Component({
  selector: 'app-pin-card',
  imports: [],
  templateUrl: './pin-card.component.html',
  styleUrl: './pin-card.component.css',
})
export class PinCardComponent {
  public readonly PathSegment = PathSegment;
  public readonly Path        = Path;

  public avatarUrl = input<string>('assets/vectors/avatar-template-dark.clr.svg');
  public userName  = input<string>('Unknown');
  public post      = input<PostT>(post);
  public pin       = input<PinT>(pin);

  // public postId         = input<number>();
  // public post           =
  // public postScore      = input<number>(0);
  // public postCommentQty = input<number>(0);
}

const pin: CatchPinT = {
  id: 1,
  userId: 'a',
  latitude: 1,
  longitude: 2,
  visibility: 0,
  kind: 1,
  createdAt: '1',
  species: 1
}

const post: PostT = {
  id: 1,
  userId: 'a',
  createdAt: 'a',
  score: 10
}


export interface PinT {
  id: number;
  userId: string;
  latitude: number;
  longitude: number;
  visibility: number;
  kind: number;
  createdAt: string;
}

export interface CatchPinT extends PinT {
  species: number;
}

export interface InformationPinT extends PinT {
  accessDifficulty: number;
  seabed: number;
}

export interface WarningPinT extends PinT {
  warkingKing: number;
}

export interface PostT {
  id: number;
  userId: string;
  body?: string;
  imageUrl?: string;
  createdAt: string;
  score: number;
}
