import { Injectable } from '@angular/core';
import { DEFAULT_AVATAR } from '@gofish/shared/constants';

@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  resolve(url?: string): string { return url ?? DEFAULT_AVATAR; }
}
