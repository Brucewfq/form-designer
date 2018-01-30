Ext.namespace("HY.Login");
HY.Login = function (config) {
    Ext.QuickTips.init(); //初始化tooltip

    this.language = new language20('GetMultipleLanguageResources', HY.Language.Login.Chinese, 'CN');
    this.cookie = new Ext.state.CookieProvider({
        expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365)) //30 days
    });

    HY.Login.superclass.constructor.call(this, config);
};
Ext.extend(HY.Login, Ext.Panel, {//
    showLogin: true, //是否载入时就显示
    isRemember: true, //是否记住最后登 录人信息
    isMultipleLanguage: true, //是否多语言
    isInformation: true, //是否显示登录信息
    url: '/LoginHandler.ashx', renderTo: 'logindiv',
    closable: false,
    resizable: false,
    width: 410,
    modal: false,
    plain: true,
    shadow: true,
    border: false,
    constrainHeader: true, //窗体header不超过游览器可视区域
    layout: 'fit',
    closeAction: 'hide',
    //登录成功后 自定义处理事件
    onSuccess: Ext.emptyFn,
    //登录失败后自定义处理事件
    onFailure: Ext.emptyFn,
    //初始化界面
    init: function () {
        var mainItems = {
            xtype: 'form',
            plain: true,
            height: 170,
            //bodyStyle: 'border:0px solid yellow;background:transparent;margin-top:20px;margin-left:80px',
            border: false,
            id: 'loginPanel',
            defaultType: 'textfield',
            defaults: {
                width: 220,
                //msgTarget: 'side',
                allowBlank: false
            },
            layoutConfig: {
                labelSeparator: ' '
            },
            labelWidth: 1,
            items: [{
                id: 'UserName',
                name: 'UserName',
                value: '',
                style: 'margin-top:18px',
                invalidText: '用户名不能为空！<br>Username can\'t be empty!',
                //fieldLabel: this.language.getText('USERNAME'),
                //fieldLabel: '请输入用户名',
                tabIndex: 1
            }, {
                xtype: 'panel',
                height: 27,
                border: false
            }, {
                id: 'UserPass',
                name: 'UserPass',
                value: '',
                invalidText: '密码不能为空！<br>Password can\'t be empty!',
                //style: 'margin-left:25px;margin-top:11px;',
                //fieldLabel: this.language.getText('PASSWORD'),
                //fieldLabel: this.language.getText('PASSWORD'),
                inputType: 'password',
                tabIndex: 2
            }]
        };

        if (this.isMultipleLanguage) {
            mainItems.items.push({
                xtype: 'combo',
                id: 'lang',
                name: 'language',
                hidden: true,
                hiddenName: 'language',
                mode: 'local',
                fieldLabel: this.language.getText('LANGUAGE'),
                displayField: 'show',
                valueField: 'value',
                forceSelection: true,
                triggerAction: 'all',
                editable: false,
                value: 'CN',
                store: new Ext.data.SimpleStore({
                    fields: ['show', 'value'],
                    data: [['中文', 'CN'], ['English', 'EN']]
                }),
                tabIndex: 3
            });
        }
        if (this.isInformation) {
            mainItems.items.push({//登录提示信息 
                autoWidth: true,
                xtype: 'panel',
                border: false,
                plain: true
                //html:this.language.getText('INFORMATION'),
                //bodyStyle: 'background-color:red;'
            });
        }
        return mainItems;
    },
    initComponent: function () {
        var mainPanel = {
            //title:this.language.getText('LOGINTITLE'),
            items: this.init(),
            height: 150,
            width: 300,
            //style: 'background:red;',
            buttonAlign: 'center',
            border: false,
            buttons: [{
                id: "submit",
                text: "登录(Sign in)",
                handler: this.login,
                alt: "登录(Sign in)",
                scope: this
            }],
            //界面点击任意键时
            keys: {
                key: [10, 13],
                fn: this.login,
                scope: this
            }
        };
        Ext.apply(this, mainPanel);
        HY.Login.superclass.initComponent.call(this);
        //wjp 判断是否显示语言框 2010-08-29
        //        Ext.Ajax.request(
        //        {
        //            url: this.url,
        //            method: 'POST',
        //            params: { method: 'LoadInitFunction' },
        //            success: function (data) {
        //                var conditon = Ext.decode(data.responseText);
        //                var loginLanguageType = conditon.loginLanguageType;

        //                if (loginLanguageType == "2") {
        //                    Ext.getCmp('lang').hide();
        //                }

        //            }
        //        });

    },
    afterRender: function () {
        HY.Login.superclass.afterRender.apply(this, arguments);
        //自动填充上次登录信息
        if (this.isRemember) {
            this.autoFill();
        }

        //		var loginPanel = Ext.getCmp('loginPanel');
        //		loginPanel.on('beforeaction',function(action){
        //			
        //		});
    },
    login: function () {
        this.disabled = true;
        var loginPanel = Ext.getCmp('loginPanel').form;
        loginPanel.submit({
            url: this.url,
            params: { method: 'LoginIn' },
            waitMsg: this.language.getText('LOGIN_WAIT_MSG'),
            method: 'POST',
            timeout: 300000,
            success: function (form, action) {
                this.success(form, action);
                this.hide();
                this.disabled = false;
            },
            failure: function (form, action) {
                this.failure(form, action);
                this.disabled = false;
            },
            scope: this
        });
    },
    success: function (form, action) {
        //是否需要记住登录人信息
        if (this.isRemember)
            this.onRemember();
        //登录成功后调用自定义事件
        if (this.onSuccess)
            this.onSuccess(form, action);
    },
    failure: function (form, action) {
        //登录失败后调用自定义事件
        if (this.onFailure)
            if (this.onFailure(form, action) === false)
                return; //自定义事件返回false则结束
        var error, data;
        if (action.response) {
            //失败后获取失败信息
            data = Ext.decode(action.response.responseText);
        } else {
            data = {};
        }
        error = data.error;
        if (!data.error)
            error = this.language.getText('LOGIN_FAILURE');
        //弹出失败原因提示框
        Ext.Msg.show({
            title: this.language.getText('ALERT_TITLE'),
            msg: error,
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
    },
    //记录上次登录人信息
    onRemember: function () {
        //记录最后登录人用户名
        var username = Ext.getCmp('UserName').getValue().trim();
        this.cookie.set('username', username, 365);

        //记录最后登录人语言
        if (this.isMultipleLanguage) {
            var language = Ext.getCmp('lang').getValue().trim();
            this.cookie.set('language', language, 365);
        }
    },
    //自动填充上次登录人信息
    autoFill: function () {
        var username = this.cookie.get('username', '')
        if (username != '') {
            Ext.getCmp('UserName').setValue(username);
            Ext.getCmp('UserPass').focus();
        }
        if (this.isMultipleLanguage) {
            var language = this.cookie.get('language', '');
            if (language != '') {
                Ext.getCmp('lang').setValue(language);
            }
        }
    }
});
