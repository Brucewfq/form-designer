import {Injectable} from '@angular/core';

/**
 * 判断控件名的服务
 */
@Injectable()
export class NameService {

  // 所有控件最大值的存取集合：键：控件类型，值：最大值
  public namesMap: Map<String, Number> = new Map();

  // 构造方法
  constructor() {
  }

  /**
   * 初始化时便利所有json文件获取最大值
   * @param targetBuilderTools
   */
  setNamesMap(targetBuilderTools: any) {
    if (targetBuilderTools) {
      for (let i = 0; i < targetBuilderTools.length; i++) {
        let data = targetBuilderTools[i];
        let inputType: string = data.inputType;
        inputType = inputType.replace('-', '');
        // 如果包含attr.name,并且attr.name是以当前inputType开头，则把后面的字符转化为数字，如果转化不了则为0
        if (data.attr && data.attr.name && data.attr.name.startsWith(inputType)) {
          let suffer = data.attr.name.substr(inputType.length);
          if (!isNaN(suffer)) {
            // 从map里获取数字进行比较
            // 如果没取到，直接给当前数字
            if (!this.namesMap.get(inputType)) {
              this.namesMap.set(inputType, +suffer);
            }
            else {
              // 如果取到了，与当前获取的数字进行对比，如果比当前的大，则不变，否则设置为当前的值
              let maxNumber: number = +this.namesMap.get(inputType);
              if (maxNumber < +suffer) {
                this.namesMap.set(inputType, +suffer);
              }
            }
          }
          else {
            // 如果不是数字，直接设置为0
            this.namesMap.set(inputType, 0);
          }
        }

        // 如果当前节点含有子节点，递归调用
        if (data.children) {
          this.setNamesMap(data.children);
        }
      }
    }
  }

  /**
   * 拖动控件时从map里获取最大的值+1，如果获取不到，返回1
   * @param inputType
   */
  getNames(inputType: String): string {
    // 如果input type中含有-则去除 -
    inputType = inputType.replace('-', '');
    // 如果没有从map里获取到，则直接给1
    if (!this.namesMap.get(inputType)) {
      this.namesMap.set(inputType, 1);
      return inputType + '1';
    }
    else {
      let maxNumber: number = +this.namesMap.get(inputType) + 1;
      this.namesMap.set(inputType, maxNumber);
      return inputType + maxNumber.toString();
    }
  }

  /**
   * 控件的属性名变化时，与map里面的控件类型的最大值进行对比，如果没有找到，则不做任何操作，如果找到最大值，则更新
   * @param inputType 输入的控件类型
   * @param attrName 属性名
   */
  updateNameMap(inputType: string, attrName: String) {
    inputType = inputType.replace('-', '');
    // 先判断当前name里面是否包含当前的inputType
    if (attrName.startsWith(inputType)) {
      let suffer = attrName.substr(inputType.length);
      let inputNumber: number = Number(suffer);
      // 如果没有从map里获取到，则直接给1
      if (!this.namesMap.get(inputType)) {
        this.namesMap.set(inputType, inputNumber);
      }
      else {
        let maxNumber: number = +this.namesMap.get(inputType);
        if (inputNumber >= maxNumber) {
          this.namesMap.set(inputType, inputNumber);
        }
      }
    }
  }

  /**
   * 当控件输入完毕检测是否存在重名的属性名称（attr.name）,存在返回true, 否则返回false
   * @param inputType 输入的控件类型
   * @param attrName 属性名
   * @param name 组建的名称
   * @param dataModel 当前组建对象
   * @param targetBuilderTools 组建对象
   */
  checkExistAttrName (attrName: String, dataModel:any, targetBuilderTools: any) {
    let inputType = dataModel.inputType;
    let name = dataModel.name;
    const filterBindPath = (node: any, targetBuilderTools) => {
      if (!node) {
        return;
      }

      if (node.inputType ===  inputType && node.name !== name && node.attr.name === attrName) {
        dataModel.isReapted = true;
      }

      if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          filterBindPath(node.children[i], targetBuilderTools);
        }
      }
    }
    filterBindPath(targetBuilderTools[0], targetBuilderTools);
  }


}
