import { Routes } from '@angular/router';
import { ToolRouteComponent } from './components/tool-route.component';

/**
 * Application routes for tool navigation.
 */
export const routes: Routes = [
  {
    path: '',
    component: ToolRouteComponent,
  },
  {
    path: 'tools/:toolId',
    component: ToolRouteComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
