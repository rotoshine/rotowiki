import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {HomeComponent} from './home.component';

import 'bootstrap/dist/css/bootstrap.css';
import {DocumentComponent} from "./document/document.component";
import {HttpModule} from "@angular/http";

import { AppComponent } from './app.component';
import { DocumentComponent } from '../document/document.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    DocumentComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
