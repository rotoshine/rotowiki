import { NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { DocumentComponent } from '../document/document.component';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent,
    DocumentComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule{ }
