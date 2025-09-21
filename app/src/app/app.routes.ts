import { Routes } from '@angular/router';
import { DataPage } from './pages/data-page/data-page';
import { AnalysisPage } from './pages/analysis-page/analysis-page';
import { MonitorPage } from './pages/monitor-page/monitor-page';

export const routes: Routes = [
  { path: '', redirectTo: '/data', pathMatch: 'full' },
  { path: 'data', component: DataPage },
  { path: 'analysis', component: AnalysisPage },
  { path: 'monitor', component: MonitorPage }
];
