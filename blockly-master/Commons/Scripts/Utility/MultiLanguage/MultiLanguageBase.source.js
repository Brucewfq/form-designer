/*
多语言类（单件模式）
第一阶段使用js全局变量缓存，防止同一页面重复加载同一资源2009/11/24
第二阶段如果有父窗口，或副框架，操作父中的language20(未开工)，进一步降低重复操作的几率
*/
var language20 = function language20(language) {
    var _language = language || '';
    var langResourceMappings = {};
    /*
    _string_table:多语言表名
    url:获取多语言的URL或者放入本地多语言对象
    language:多语言语种
    */
    return function (_string_table, url, language) {
        language = language || _language || '';

        if (typeof (url) == 'object') {
            langResourceMappings[_string_table + language] = url;
        } else {
            this.url = url;
        }
        var totalData = {};
        this.MultipleLanguageResources = {};
        //判断是否已存在
        if (!langResourceMappings[_string_table + language]) {
            totalData = getString_Table(url);
            this.MultipleLanguageResources = totalData.MultipleLanguageResources;
            langResourceMappings[_string_table + language] = this.MultipleLanguageResources;
        }
        else {
            this.MultipleLanguageResources = langResourceMappings[_string_table + language];
        }
        //远程获取多语言表
        function getString_Table(url) {
            var totalInfo = {};
            //AJAX同步方式
            var conn = Ext.lib.Ajax.getConnectionObject().conn;
            var math = Math.random().toFixed(4);
            conn.open("GET", url + '?method=' + _string_table + '&lang=' + language + '&math=' + math, false);
            conn.send(null);
            try {
                //document.cookie;
                totalInfo = conn.responseText == '' ? {} : Ext.decode(conn.responseText);
            } catch (e) {
            }
            return totalInfo;
        }
        //多语言变量替换
        this.getText = function (str, args) {
            if (!this.MultipleLanguageResources || this.MultipleLanguageResources[str] === undefined)
                return str;

            str = this.MultipleLanguageResources[str];
            return _tx(str, args);
        };
        function _tx(str, args) {
            if (args) {
                if (typeof args == 'object') {
                    var regexp;
                    for (var key in args) {
                        regexp = new RegExp('\{' + key + '\}', 'g');
                        str = str.replace(regexp, args[key]);
                    }
                }
            }
            return str;
        }
    };
} ();


//function language20(_string_table, url, method)
//{
//	this.url = url;
//	var totalData = {};
//	this.langResourceMapping = {};
//	if(url)
//	{
//		totalData = getString_Table(url, method);
//		this.string_table = totalData.MultipleLanguageResources;
//		//this.langResourceMapping = totalData.LangResourceMapping;
//	}
//	else
//		this.string_table = _string_table; 
//	this.getText = function(str,args)
//	{
//		str = this.string_table[str];
//		return _tx(str,args);
//	}
//    function _tx(str,args)
//    {
//        if(args)
//        {
//	        if(typeof args=='object')
//	        {
//		        var regexp;
//		        for(var key in args)
//		        {
//			        regexp=new RegExp('\{'+key+'\}','g');
//			        //str=str.replace(regexp,args[key]);
//		        }
//	        }
//        }
//        return str;
//    }
//	 
//    function getString_Table(url, method)
//    {
//        var totalInfo = {};
////        $.ajax({
////            url: url,
////            type: "POST",
////            cache: false,
////            async: false,
////            data:{method:method},
////            dataType :"json",
////            success: function(data){
////                totalInfo = data;
////            }
////        });
////         
//         
//     	var conn = Ext.lib.Ajax.getConnectionObject().conn;
//        conn.open("post", url+"?method="+method, false);
//        conn.send(null);
//        totalInfo = Ext.decode(conn.responseText);
//        return totalInfo;

//    }
//}
