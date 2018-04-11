import {Injectable} from '@angular/core';
import {HttpService} from '../service/http.service';

declare let document: any;
declare let blocklyInit: any;
declare let blocklySetVal: any;
declare let blocklyGetJsCode: any;
declare let blocklyGetXmlCode: any;
declare let loadXml: any;
declare let nowBlock: any;
declare let factoryInit: any;
declare let xmlToJs: any;

@Injectable()
export class ScriptLoaderService {

  constructor(private httpService: HttpService) {
  }

  /**
   * 初始化加载blockly
   * @param obj angular中blockly对应组件的对象
   * @param defaultXml 初始化回显数据
   */
  load(obj, defaultXml) {
    if (blocklyInit) {
      //
      this.httpService.getData('object/api/last/registryBlockObj/page', {}).then((res) => {
        if (res.responseCode === '100') {
          blocklyInit(obj, defaultXml, res.registryBlockObjList);
        }
      })
    }
  }

  /**
   * 初始化加载blocklyFactory
   * @param obj angular中blockly对应组件的对象
   * @param defaultXml 初始化回显数据
   */
  loadFactory(obj, defaultXml) {
    if (factoryInit) {
      factoryInit(obj, defaultXml);
    }
  }

  /**
   * 加载blockly xml数据
   * @param xml blockly xml数据
   */
  loadXml(xml) {
    if (loadXml) {
      loadXml(xml);
    }
  }

  /**
   * 给当前正在操作的block积木的key对应的 field 赋值
   * @param key field的标识
   * @param val 值
   */
  setVal(key, val) {
    if (blocklySetVal) {
      blocklySetVal(key, val);
    }
  }

  /**
   * 获取blockly通过js翻译后的数据
   */
  getJsCode(): any {
    if (blocklyGetJsCode) {
      return blocklyGetJsCode();
    } else {
      return null;
    }
  }

  /**
   * 获取blockly通过xml翻译后的数据
   */
  getXmlCode(): any {
    if (blocklyGetXmlCode) {
      return blocklyGetXmlCode();
    } else {
      return null;
    }
  }

  /**
   * 获取当前block的数据
   */
  getNowBlock(): any {
    return nowBlock;
  }

  /**
   * @param targetXml
   * @returns {any}
   */
  changeXmlToJs(targetXml) {
    if (xmlToJs) {
      const result = xmlToJs(targetXml);
      if (result) {
        targetXml = result;
      }
    }
    return targetXml;
  }
}
