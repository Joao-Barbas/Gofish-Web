import { Component } from '@angular/core';
import { GfCardPinPreviewComponent } from "@gofish/shared/components/gf-card-pin-preview/gf-card-pin-preview.component";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { PinService } from '@gofish/features/map/services/pin.service';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';

import { Species } from '../../../../shared/enums/species.enum';
import { Bait } from '../../../../shared/enums/bait.enums';
import { AccessDifficulty } from '../../../../shared/enums/access-difficulty.enums';
import { Seabed } from '../../../../shared/enums/seabed.enum';
import { WarningKind } from '../../../../shared/enums/warning-kind.enum';
import { PinDataResDTO } from '@gofish/shared/dtos/pin.dto';

@Component({
  selector: 'app-stats-reports',
  imports: [GfCardPinPreviewComponent, RouterLink],
  templateUrl: './stats-reports.component.html',
  styleUrl: './stats-reports.component.css',
})
export class StatsReportsComponent {
  protected readonly Species = Species;
  protected readonly Bait = Bait;
  protected readonly AccessDifficulty = AccessDifficulty;
  protected readonly Seabed = Seabed;
  protected readonly WarningKind = WarningKind;

  testPin = MOCK_CATCH_PIN;
  testPin2 = MOCK_WARN_PIN;


}

// Exemplo de um PIN DE PESCA (Kind: 0)
export const MOCK_CATCH_PIN: PinDataResDTO = {
  id: 101,
  createdAt: new Date().toISOString(),
  visibility: 0,
  kind: 0, // Catch
  author: {
    id: 'user-1',
    userName: 'pedro_pesca_88',
    firstName: 'Pedro',
    lastName: 'Silva',
    avatarUrl: 'https://i.pravatar.cc/150?u=pedro'
  },
  post: {
    id: 501,
    body: 'Grande captura na Barragem de Montargil!',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-47a184230184?w=500', // Imagem de pesca
    score: 25,
    commentCount: 4,
    userVote: 1 // Utilizador já deu upvote
  },
  details: {
    species: 1, // Robalo
    bait: 2,    // Minhoca
    hookSize: 'Nº 4',
    accessDificulty: 0, // Note: Spelling do teu DTO (Dificulty com 1 'f')
    seabed: 0,
    warningKind: 0
  },
  geolocation: {
    latitude: 39.2483,
    longitude: -8.1583
  }
};

// Exemplo de um PIN DE AVISO (Kind: 2)
export const MOCK_WARN_PIN: PinDataResDTO = {
  id: 102,
  createdAt: '2024-11-10T14:00:00Z',
  visibility: 0,
  kind: 2, // Warning
  author: {
    id: 'user-2',
    userName: 'mar_seguro',
    firstName: 'Ana',
    lastName: 'Costa',
    avatarUrl: 'https://i.pravatar.cc/150?u=ana'
  },
  post: {
    body: 'Zona com rochas submersas perigosas na maré vazia.',
    score: -2,
    commentCount: 1
  },
  details: {
    species: 0,
    bait: 0,
    hookSize: '',
    accessDificulty: 0,
    seabed: 0,
    warningKind: 1 // Perigo/Rocha
  }
};
