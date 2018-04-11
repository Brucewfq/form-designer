import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'formatJson',
	pure: false
})
export class formatJsonPipe implements PipeTransform {
	transform (val: any, args?: any) {
		let cache = [];
		let jsonStr = JSON.stringify(val, (key, value) => {
		    if (typeof value === 'object' && value !== null) {
		        if (cache.indexOf(value) !== -1) {
		            // Circular reference found, discard key
		            return;
		        }
		        // Store value in our collection
		        cache.push(value);
		    }
		    return value;
		});
	  return JSON.parse(jsonStr);
	}
}
