/*model 左边menu菜单数据*/
import {Injectable} from '@angular/core';

export const section = {
  name: 'section',
  children: [],
  inputType: 'section-child',
  icon: 'section',
  class: 'wide',
  isSubSection: true,
  attr: {
    visible: {},
    readOnly: {}
  }
};

export const Model = [
  {
    label: 'Containers',
    icon: 'settings',
    badge: '5',
    items: [
      {
        label: 'Section',
        iconUrl: '../assets/icons/side-bar/section-icon.svg',
        drop: [
          Object.assign({}, section, {isSubSection: false, inputType: 'section'})
        ]
      },
      {
        label: '2-Column',
        iconUrl: '../assets/icons/side-bar/2column-icon.svg',
        drop: [
          {
            name: 'section-col-2',
            children: [
              section,
              section
            ],
            inputType: 'section-cols',
            icon: 'section',
            class: 'wide',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: '3-Column',
        iconUrl: '../assets/icons/side-bar/3column-icon.svg',
        drop: [
          {
            name: 'section-col-3',
            children: [
              section,
              section,
              section
            ],
            inputType: 'section-cols',
            icon: 'section',
            class: 'wide',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: '4-Column',
        iconUrl: '../assets/icons/side-bar/4column-icon.svg',
        drop: [
          {
            name: 'section-col-4',
            children: [
              section,
              section,
              section,
              section
            ],
            inputType: 'section-cols',
            icon: 'section',
            class: 'wide',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'toolbar',
        iconUrl: '../assets/icons/side-bar/toolbar-icon.svg',
        drop: [
          {
            name: 'toolbar',
            inputType: 'toolbar',
            icon: 'field-text',
            class: 'half',
            children: [],
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      }
    ]
  },
  {
    label: 'BasicFields',
    icon: 'palette',
    badge: '9',
    items: [
      {
        label: 'String',
        iconUrl: '../assets/icons/side-bar/textbox-icon.svg',
        drop: [
          {
            name: 'textbox',
            inputType: 'textbox',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'Number',
        iconUrl: '../assets/icons/side-bar/number-icon.svg',
        drop: [
          {
            name: 'number',
            inputType: 'number',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'Checkbox',
        iconUrl: '../assets/icons/side-bar/checkbox-icon.svg',
        drop: [
          {
            name: 'checkbox',
            inputType: 'checkbox',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'Dropdown',
        iconUrl: '../assets/icons/side-bar/dropdown-icon.svg',
        drop: [
          {
            name: 'dropdown',
            inputType: 'dropdown',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'Label',
        iconUrl: '../assets/icons/side-bar/label-icon.svg',
        drop: [
          {
            name: 'label',
            inputType: 'label',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'Date',
        iconUrl: '../assets/icons/side-bar/time-icon.svg',
        drop: [
          {
            name: 'date',
            inputType: 'datetime',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'Radio',
        iconUrl: '../assets/icons/side-bar/radiobutton-icon.svg',
        drop: [
          {
            name: 'radio',
            inputType: 'radio',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'ChooseBox',
        iconUrl: '../assets/icons/side-bar/autocomplete-icon.svg',
        drop: [
          {
            name: 'ChooseBox',
            inputType: 'choosebox',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'Textarea',
        iconUrl: '../assets/icons/side-bar/textarea-icon.svg',
        drop: [
          {
            name: 'textarea',
            inputType: 'textarea',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'image',
        iconUrl: '../assets/icons/side-bar/image-upload.svg',
        drop: [
          {
            name: 'iamge',
            inputType: 'image',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
    ]
  },
  {
    label: 'Buttons',
    icon: 'palette',
    badge: '2',
    items: [
      {
        label: 'button',
        iconUrl: '../assets/icons/side-bar/button-icon.svg',
        drop: [
          {
            name: 'Button',
            inputType: 'button',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      /*{
          label: 'process',
          iconUrl: '../assets/icons/side-bar/process-icon.svg',
          drop: [
              {
                  name: 'process',
                  inputType: 'process',
                  icon: 'field-text',
                  class: 'half',
                  attr: {
                      visible: {
                          edit: true,
                          check: true,
                          lookOver: true
                      },
                      readOnly: {
                          edit: false,
                          check: false,
                          lookOver: false
                      }
                  }
              }
          ]
      },*/
      {
        label: 'submit',
        iconUrl: '../assets/icons/side-bar/submitbutton-icon.svg',
        drop: [
          {
            name: 'submit',
            inputType: 'submit',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      // {
      //     label: 'hyperlink',
      //     iconUrl: '../assets/icons/side-bar/hyperlinkbutton-icon.svg',
      //     drop: [
      //         {
      //             name: 'hyperlink',
      //             inputType: 'hyperlink',
      //             icon: 'field-text',
      //             class: 'half',
      //             attr: {
      //                 visible: {
      //                     edit: true,
      //                     check: true,
      //                     lookOver: true
      //                 },
      //                 readOnly: {
      //                     edit: false,
      //                     check: false,
      //                     lookOver: false
      //                 }
      //             }
      //         }
      //     ]
      // },
    ]
  },
  {
    label: 'Datas',
    icon: 'palette',
    badge: '3',
    items: [
      {
        label: 'data-grid',
        iconUrl: '../assets/icons/side-bar/datagrid-icon.svg',
        drop: [
          {
            name: 'data-grid',
            inputType: 'data-grid',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      // {
      //     label: 'tree-grid',
      //     iconUrl: '../assets/icons/side-bar/treegrid-icon.svg',
      //     drop: [
      //         {
      //             name: 'tree-grid',
      //             inputType: 'tree-grid',
      //             icon: 'field-text',
      //             class: 'half',
      //             attr: {
      //                 visible: {
      //                     edit: true,
      //                     check: true,
      //                     lookOver: true
      //                 },
      //                 readOnly: {
      //                     edit: false,
      //                     check: false,
      //                     lookOver: false
      //                 }
      //             }
      //         }
      //     ]
      // },
      {
        label: 'Tab',
        iconUrl: '../assets/icons/side-bar/tab-icon.svg',
        drop: [
          {
            name: 'tab',
            inputType: 'tab',
            icon: 'field-text',
            class: 'half',
            children: [{
              name: 'tabitem1',
              children: [],
              inputType: 'tabitem',
              icon: 'section',
              class: 'wide',
              attr: {
                title: 'tabitem1',
                name: 'tabitem1',
                visible: {},
                readOnly: {}
              }
            }, {
              name: 'tabitem2',
              children: [],
              inputType: 'tabitem',
              icon: 'section',
              class: 'wide',
              attr: {
                title: 'tabitem2',
                name: 'tabitem2',
                visible: {},
                readOnly: {}
              }
            }],
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
      {
        label: 'file',
        iconUrl: '../assets/icons/side-bar/file-icon.svg',
        drop: [
          {
            name: 'file',
            inputType: 'file',
            icon: 'field-text',
            class: 'half',
            attr: {
              visible: {},
              readOnly: {}
            }
          }
        ]
      },
    ]
  },
  // {"label":"Template","icon":"settings","badge":"1","items":[{"label":"Template","name":"ana","isTemplate":true,"iconUrl":"../assets/icons/template.svg","drop":[{"name":"section-col-2_1516345583084","children":[{"name":"sect523","children":[{"name":"textbox_1516345585412","inputType":"textbox","icon":"field-text","class":"half","attr":{"visible":{"edit":true,"check":true,"lookOver":true},"readOnly":{"edit":false,"check":false,"lookOver":false},"name":"textbox2"}}],"inputType":"section-child","icon":"section","class":"wide","isSubSection":true,"attr":{"visible":{"edit":true,"check":true,"lookOver":true},"readOnly":{"edit":false,"check":false,"lookOver":false}}},{"name":"sect523","children":[],"inputType":"section-child","icon":"section","class":"wide","isSubSection":true,"attr":{"visible":{"edit":true,"check":true,"lookOver":true},"readOnly":{"edit":false,"check":false,"lookOver":false}}}],"inputType":"section-cols","icon":"section","class":"wide","attr":{"visible":{"edit":true,"check":true,"lookOver":true},"readOnly":{"edit":false,"check":false,"lookOver":false},"name":"ana","description":{"zh_CN":"asdf","en":"asdf"}}}]}]}
]

@Injectable()
export class AppModelService {

  getModel() {
    return Model;
  }
}
