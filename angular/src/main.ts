import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

/*
BAD (Type-based):
/app/components/product-list
/app/components/product-detail
/app/services/product-service
/app/models/product

GOOD (Feature-based):
/app/features/products/
  ├── components/
  │   ├── product-list/
  │   └── product-detail/
  ├── services/
  │   └── product.service.ts
  └── models/
      └── product.model.ts
/app/shared/
  ├── constants/
  ├── components/ <-- Like buttons, radios boxes, etc...
  ├── guards/
  ├── interceptors/
  ├── models/
  ├── pipes/
  └── services/ <-- Use in multiple components, eg. auth
*/
