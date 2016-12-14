import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HomeComponent} from './home.component';
import {DocumentComponent} from "./document/document.component";

import 'bootstrap/dist/css/bootstrap.css';

@NgModule({
  imports: [
    BrowserModule,
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
