import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { FlightListComponent } from './flight-list/flight-list.component';
import { FlightEditorComponent } from './flight-editor/flight-editor.component';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  { path: 'flightplanner/list', component: FlightListComponent },
  { path: 'flightplanner/edit/:name', component: FlightEditorComponent },
  { path: 'flightplanner', component: FlightListComponent },
  {
    path: '',
    redirectTo: '/flightplanner',
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    AppComponent,
    FlightListComponent,
    FlightEditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes, { useHash: true }
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
