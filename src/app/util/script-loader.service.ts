import { Injectable } from '@angular/core';
import * as $ from 'jquery';

declare let document: any;
declare let blocklyInit: any;

interface Script {
    src: string;
    loaded: boolean;
}

@Injectable()
export class ScriptLoaderService {
    private _scripts: Script[] = [];
    private tag: any;

  load() {
        // this.tag = tag;
        // scripts.forEach((script: string) => this._scripts[script] = { src: script, loaded: false });
        //
        // let promises: any[] = [];
        // scripts.forEach((script) => promises.push(this.loadScript(script)));
        // return Promise.all(promises);
      if (blocklyInit) {

        blocklyInit.call();
      }
    }
}
