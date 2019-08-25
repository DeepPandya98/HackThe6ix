import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingComponent } from './landing/landing.component';
import { MatFormFieldModule } from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table'

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LandingComponent
  ],
  exports:[
    MatFormFieldModule
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatFormFieldModule,
    CdkTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
