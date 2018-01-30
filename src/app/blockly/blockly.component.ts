import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AppComponent} from '../app.component';

import { ScriptLoaderService } from '../util/script-loader.service';

@Component({
    selector: 'app-blockly',
    // templateUrl: './blockly.component.html'
    templateUrl: '../../../blockly-master/demos/code/index.html',
    styleUrls: ['../../../blockly-master/demos/code/blocklystyle.css']
})

export class BlocklyComponent implements OnInit, AfterViewInit {
  constructor(private _script: ScriptLoaderService) {
    };

  ngOnInit () {
  }

  ngAfterViewInit() {
    this._script.load();

  }
}
