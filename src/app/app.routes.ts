import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';

export const routes: Routes = [
    // {path: '', component: DashboardComponent},
    // {path: 'select-tree-demo', component: TreeDemoComponent},
    // {path: 'ztree-demo', component: ZtreeDemoComponent}
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
