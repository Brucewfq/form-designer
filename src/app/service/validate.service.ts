import {Injectable} from '@angular/core';
import {ConfirmationService, Message} from 'primeng/primeng';

@Injectable()
export class ValidateService {
  public dataMap: any = {};
  public ERROR = 'error';
  public SUCCESS = 'success';
  msgs: Message[] = [];

  // 构造方法
  constructor(private confirmationService: ConfirmationService) {
  }

  /**
   * 验证非空
   * @param value
   */
  required(value: string) {
    const bool = value.replace(/\s/g, '') !== '';
    return bool;
  }

  /**
   * 验证最大长度
   * @param value
   * @param max
   */
  maxLength(value: string, max: number): boolean {
    const bool = value.length <= max;
    return bool;
  }

  /**
   * 验证最小长度
   * @param value
   * @param min
   */
  minLength(value: string, min: number): boolean {
    const bool = value.length >= min;
    return bool;
  }

  /**
   * 验证纯数字
   * @param value
   */
  pureNumber(value: string): boolean {
    const bool = /^\d{1,}$/.test(value);
    return bool;
  }

  /**
   * 验证纯字符(大小写字母)
   * @param value
   */
  pureString(value: string): boolean {
    const bool = /^[A-Za-z]+$/.test(value);
    return bool;
  }

  /**
   * 验证构成变量名(数字字母下划线， 数字不能开头)
   * @param value
   */
  variable(value: string): boolean {
    // const reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[A-Za-z_][A-Za-z_0-9]{0,}$/;
    const reg = /^(?![0-9]+$)[A-Za-z_][A-Za-z_0-9]{0,}$/;
    const bool = reg.test(value);
    return bool;
  }

  /**
   * 验证构成字符串(数字字母下划线)
   * @param value
   */
  character(value: string): boolean {
    const reg = /^\w+$/g;
    const bool = reg.test(value);
    return bool;
  }

  /**
   * 验证手机号
   * @param value
   */
  phoneNum(value: string): boolean {
    const reg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|17[0|1|3|5|6|7|8]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
    const bool = reg.test(value);
    return bool;
  }

  /**
   * 验证邮箱
   * @param value
   */
  email(value: string): boolean {
    const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const bool = reg.test(value);
    return bool;
  }

  /**
   * 验证邮编
   * @param value
   */
  mailCode(value: string): boolean {
    const reg = /[1-9]\d{5}(?!\d)/;
    const bool = reg.test(value);
    return bool;
  }

  putData(key: string, data: any) {
    this.dataMap[key] = data;
  }

  getDataByKey(key: string): any {
    return this.dataMap[key];
  }

  // 返回当前组建的所有的错误信息
  getDataByName(key: string): any {
    const validate = [];
    for (const realkey in this.dataMap) {
      if (realkey.startsWith(key)) {
        validate.push(this.getDataByKey(realkey));
      }
    }
    return validate;
  }

  removeDataByKey(key: string): any {
    delete this.dataMap[key];
  }

  // 获取当前在册的key值
  gatherDataMapKeys(name: string) {
    const arr: any[] = [];
    for (const key in this.dataMap) {
      if (key.startsWith(name)) {
        arr.push(key);
      }
    }
    return arr;
  }
}
