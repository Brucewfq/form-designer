import {Component, Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class MyService {
    change: EventEmitter<number>;

    //标题
    titleEventEmitter:EventEmitter<string>;

    constructor () {
        this.change = new EventEmitter();
        this.titleEventEmitter = new EventEmitter();
    }
}