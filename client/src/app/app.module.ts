import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {HttpModule} from "@angular/http";

import 'bootstrap/dist/css/bootstrap.css';


import {AppComponent} from './app.component';
import {HomeComponent} from './home.component';
import {DocumentComponent} from '../document/document.component';

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
export class AppModule {
}
