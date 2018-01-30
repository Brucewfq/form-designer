// JavaScript Document
function DataAccess(url,params,method)
{
	this.params={};
	this.url="";
	this.method="GET";
	if(params)
	{
		this.params=params;
	}

	if(url)
	{
		this.url=url;
	}
	if(method)
	{
		this.method=method;
	}
	this.Request=function()
	{
		Ext.Ajax.request({
			url:this.url,
			params:this.params,
			method:this.method,
			success:this.success,
			failure:this.failure
		});
	};
	this.success=function(result,request){return result.responseXML.xml;};
	this.failure=function(result,request){var error={};error.message='error:server return a Exception.';error.detail=result.responseText;};
}
function rmbMoney(v){
	v = (Math.round((v-0)*100))/100;
	v = (v == Math.floor(v)) ? v + ".00" : ((v*10 == Math.floor(v*10)) ? v + "0" : v);
	v = String(v);
	var ps = v.split('.');
	var whole = ps[0];
	var sub = ps[1] ? '.'+ ps[1] : '.00';
	var r = /(\d+)(\d{3})/;
	while (r.test(whole)) {
		whole = whole.replace(r, '$1' + ',' + '$2');
	}
	v = whole + sub;
	if(v.charAt(0) == '-'){
		return '-￥' + v.substr(1);
	}
	return "￥" +  v;
};
function RMBMoney(currencyDigits) {
	// Constants:
	var MAXIMUM_NUMBER = 99999999999.99;
	// Predefine the radix characters and currency symbols for output:
	var CN_ZERO = "零";
	var CN_ONE = "壹";
	var CN_TWO = "贰";
	var CN_THREE = "叁";
	var CN_FOUR = "肆";
	var CN_FIVE = "伍";
	var CN_SIX = "陆";
	var CN_SEVEN = "柒";
	var CN_EIGHT = "捌";
	var CN_NINE = "玖";
	var CN_TEN = "拾";
	var CN_HUNDRED = "佰";
	var CN_THOUSAND = "仟";
	var CN_TEN_THOUSAND = "万";
	var CN_HUNDRED_MILLION = "亿";
	var CN_SYMBOL = "人民币";
	var CN_DOLLAR = "元";
	var CN_TEN_CENT = "角";
	var CN_CENT = "分";
	var CN_INTEGER = "整";

	// Variables:
	var integral; // Represent integral part of digit number.
	var decimal; // Represent decimal part of digit number.
	var outputCharacters; // The output result.
	var parts;
	var digits, radices, bigRadices, decimals;
	var zeroCount;
	var i, p, d;
	var quotient, modulus;

	// Validate input string:
	currencyDigits = currencyDigits.toString();
	if (currencyDigits == "") {
		alert("Empty input!");
		return "";
	}
	if (currencyDigits.match(/[^,.\d]/) != null) {
		alert("Invalid characters in the input string!");
		return "";
	}
	if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
		alert("Illegal format of digit number!");
		return "";
	}

	// Normalize the format of input digits:
	currencyDigits = currencyDigits.replace(/,/g, ""); // Remove comma delimiters.
	currencyDigits = currencyDigits.replace(/^0+/, ""); // Trim zeros at the beginning.
	// Assert the number is not greater than the maximum number.
	if (Number(currencyDigits) > MAXIMUM_NUMBER) {
		alert("Too large a number to convert!");
		return "";
	}

	// Process the coversion from currency digits to characters:
	// Separate integral and decimal parts before processing coversion:
	parts = currencyDigits.split(".");
	if (parts.length > 1) {
		integral = parts[0];
		decimal = parts[1];
		// Cut down redundant decimal digits that are after the second.
		decimal = decimal.substr(0, 2);
	}
	else {
		integral = parts[0];
		decimal = "";
	}
	// Prepare the characters corresponding to the digits:
	digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
	radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
	bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
	decimals = new Array(CN_TEN_CENT, CN_CENT);
	// Start processing:
	outputCharacters = "";
	// Process integral part if it is larger than 0:
	if (Number(integral) > 0) {
		zeroCount = 0;
		for (i = 0; i < integral.length; i++) {
			p = integral.length - i - 1;
			d = integral.substr(i, 1);
			quotient = p / 4;
			modulus = p % 4;
			if (d == "0") {
				zeroCount++;
			}
			else {
				if (zeroCount > 0)
				{
					outputCharacters += digits[0];
				}
				zeroCount = 0;
				outputCharacters += digits[Number(d)] + radices[modulus];
			}
			if (modulus == 0 && zeroCount < 4) {
				outputCharacters += bigRadices[quotient];
			}
		}
		outputCharacters += CN_DOLLAR;
	}
	// Process decimal part if there is:
	if (decimal != "") {
		for (i = 0; i < decimal.length; i++) {
			d = decimal.substr(i, 1);
			if (d != "0") {
				outputCharacters += digits[Number(d)] + decimals[i];
			}
		}
	}
	// Confirm and return the final output string:
	if (outputCharacters == "") {
		outputCharacters = CN_ZERO + CN_DOLLAR;
	}
	if (decimal == "") {
		outputCharacters += CN_INTEGER;
	}
	outputCharacters = CN_SYMBOL + outputCharacters;
	return outputCharacters;
}

function XmlDocument(type)
{
	var xml;
	//if(type=="ie"||type==null) //modified by lyf
	if(window.ActiveXObject)
	{
		xml=new  ActiveXObject("MSXML2.DOMDocument.3.0");
	}
	else{
		xml = document.implementation.createDocument("","",null); //add by lyf
	}
	return xml;
}

function myBool(v)
{
	if(v)
	{
		if(v.toLowerCase()=='true')
		{
			return true;
		}
		else if(v.toLowerCase()=='false'){
			return false;
		}
	}
	return Boolean(v);
}
//---------以下是对STORE和RECORD的封装---

//根据RECORD的定义生成对应XML字符串
//参数DEFAULTRECORD：一个RECORD定义对象Ext.data.Record.create
function CreateDefineXmlByRecordDefine(defaultRecord)
{
	var xDoc=XmlDocument();
	var RowNode=xDoc.createElement("Columns");
	for(var i=0;i<defaultRecord.prototype.fields.items.length;i++)
	{
		var fielditem=defaultRecord.prototype.fields.items[i];
		var newNode=xDoc.createElement("Column");

		var name=xDoc.createElement("name");
		var defaultValue=xDoc.createElement("defaultValue");
		var mapping=xDoc.createElement("mapping");
		var dateFormat=xDoc.createElement("dateFormat");
		var sortDir=xDoc.createElement("sortDir");
		var type=xDoc.createElement("type");
		name.text=fielditem.name ;
		defaultValue.text=fielditem.defaultValue ;
		if(fielditem.mapping!=null)
		{
			mapping.text=fielditem.mapping ;
		}
		else
		{mapping.text="null";}
		if(fielditem.dateFormat!=null)
		{
			dateFormat.text=fielditem.dateFormat ;
		}
		else
		{dateFormat.text="null";}
		sortDir.text=fielditem.sortDir ;
		type.text=fielditem.type ;

		newNode.appendChild(name);
		newNode.appendChild(defaultValue);
		newNode.appendChild(mapping);
		newNode.appendChild(dateFormat);
		newNode.appendChild(sortDir);
		newNode.appendChild(type);

		RowNode.appendChild(newNode);
	}
	xDoc.appendChild(RowNode);

	return xDoc.xml;
}
//根据XML文本返回一个RECORD定义Ext.data.Record.create
//参数defineXml.定义XML文本
function GetRecordDefineByDefineXml(defineXml)
{

	var definearrays=[];
	var xdoc=new XmlDocument();
	xdoc.loadXML (defineXml);

	var cols=xdoc.selectNodes("//Column");

	for(var i=0;i<cols.length;i++)
	{
		var configattr={};
		if(cols[i].selectSingleNode("name")!=null&&cols[i].selectSingleNode("name").text!="")
		{
			configattr.name=cols[i].selectSingleNode("name").text;
		}
		if(cols[i].selectSingleNode("defaultValue")!=null&&cols[i].selectSingleNode("defaultValue").text!="")
		{
			configattr.defaultValue=cols[i].selectSingleNode("defaultValue").text;
		}
		if(cols[i].selectSingleNode("mapping")!=null&&cols[i].selectSingleNode("mapping").text!="")
		{
			configattr.mapping=cols[i].selectSingleNode("mapping").text;
		}
		if(cols[i].selectSingleNode("dateFormat")!=null&&cols[i].selectSingleNode("dateFormat").text!="")
		{
			configattr.dateFormat=cols[i].selectSingleNode("dateFormat").text;
		}
		if(cols[i].selectSingleNode("sortDir")!=null&&cols[i].selectSingleNode("sortDir").text!="")
		{
			configattr.sortDir=cols[i].selectSingleNode("sortDir").text;
		}
		if(cols[i].selectSingleNode("type")!=null&&cols[i].selectSingleNode("type").text!="")
		{
			configattr.type=cols[i].selectSingleNode("type").text;
		}

		definearrays.push(configattr);
	}
	var recorddefine=Ext.data.Record.create(definearrays);
	return recorddefine;
}

//根据XML定义生成一个默认值的RECORD数据
//参数XmlColDefine，RECORD定义XML文档字符串
function CreateBlankRecord(XmlColDefine)
{
	var xdoc=new XmlDocument();
	xdoc.loadXML(XmlColDefine);
	var cols=xdoc.selectNodes("//Column");
	var defaultdata="{";
	for(var i=0;i<cols.length;i++)
	{
		var colname=""
		var defaultvalue="";
		if(cols[i].selectSingleNode("name"))
		{
			colname=cols[i].selectSingleNode("name").text;
		}
		if(cols[i].selectSingleNode("defaultValue"))
		{
			defaultvalue=cols[i].selectSingleNode("defaultValue").text;
		}
		if(i>0)
		{defaultdata+=",";}
		defaultdata+=colname+":'"+defaultvalue+"'";
	}
	defaultdata+="}";
	defaultdata=eval('('+defaultdata+')')
	var RecordDefine=GetRecordDefineByDefineXml(XmlColDefine);
	var newrow = new RecordDefine(defaultdata);

	return newrow;
}
//根据一个RECORD数据行得到其XML，主要被GenerateXmlByStor方法
//参数parentNode，父XML节点，在这里默认为TABLE（即一个行的标签）；DefineXml：需要生成RECORD的定义XML文档字符串，需要转换的RECORD对象
function GenerateXmlByRecord(parentNode,DefineXml,RecordData)
{
	var definexdoc=new XmlDocument();
	var xdoc=parentNode.selectSingleNode("/");
	parentNode.setAttribute("id",RecordData.id);
	definexdoc.loadXML(DefineXml);

	var cols=definexdoc.selectNodes("//Column");
	for(var i=0;i<cols.length;i++)
	{
		var name=cols[i].selectSingleNode("name").text;

		var value=RecordData.data[name];

		if(value==null)
		{
			value="";
		}
		var rooddoc=xdoc.selectSingleNode("/");
		var node=rooddoc.createElement(name);
		node.text=value;

		parentNode.appendChild(node);
	}
}

//根据一个RECORD数据行得到其XML，主要被GenerateXmlByStor方法
//参数parentNode，父XML节点，在这里默认为DataSet（即一个数据源的标签）；DefineXml：需要生成RECORD的定义XML文档字符串，需要转换的STORE对象
function GenerateXmlByStore(parentnode,DefineXml,store)
{
	var xdoc=parentnode.selectSingleNode("/");

	parentnode.setAttribute("id",store.id);

	for(var i=0;i<store.data.items.length;i++)
	{
		var record=store.data.items[i];
		var node=xdoc.createElement("Table");
		parentnode.appendChild(node);
		GenerateXmlByRecord(node,DefineXml,record);

	}
}
//根据XML定义文件和数据源XML生成一条RECORD值，主要被GenerateStoreByXml
//参数 DataXmlNode:数据源节点，一般指Table;   DefineXml是定义RECORD的XML文本
function GenerateRecordByXml(DataXmlNode,DefineXml)
{
	var xdoc=new XmlDocument();
	xdoc.loadXML(DefineXml);
	var cols=xdoc.selectNodes("//Column");
	var recordid;
	if(DataXmlNode.selectSingleNode("@id"))
	{
		recordid=DataXmlNode.selectSingleNode("@id").value;
	}
	var dataArray=new Array();
	var data={};
	for(var i=0;i<cols.length;i++)
	{

		var colname="";
		var mapping="";
		var type="";
		if(cols[i].selectSingleNode("name")!=null)
		{
			colname=cols[i].selectSingleNode("name").text;
		}
		if(cols[i].selectSingleNode("mapping")!=null)
		{
			mapping=cols[i].selectSingleNode("mapping").text;
		}
		if(cols[i].selectSingleNode("type")!=null)
		{
			type=cols[i].selectSingleNode("type").text;
		}
		var value="";
		if(mapping==null||mapping=="")
		{
			value=DataXmlNode.selectSingleNode(colname).text;//dt = Date.parseDate("2006-1-15", "Y-m-d");
		}
		else
		{
			if(DataXmlNode.selectSingleNode(mapping)==null)
			{
				if(value=DataXmlNode.selectSingleNode(colname))//jiaokun 这个地方很痛苦，如果从后台绑定出来并且希望用COMBOBOX，那么后台必须为VALUE列生成一列VALUE_TEXT列，里面的值是VALUE的TEXT，这样才能正常显示
				{
					value=DataXmlNode.selectSingleNode(colname).text;
				}
				else
				{
					value="";
				}
			}
			else
			{
				value=DataXmlNode.selectSingleNode(mapping).text;
			}
		}
		if(type=="date")
		{
			var dt=new Date();
			dt = Date.parseDate(value, "Y-m-d");
			value=dt;
		}
		data[colname]=value;
	}
	var RecordDefine=GetRecordDefineByDefineXml(DefineXml);

	var newrow = new RecordDefine(data);
	if(recordid)
	{
		newrow.id=recordid;
	}
	return newrow;
}

//根据XML定义文件和数据源XML生成一个Store对象，主要被GenerateStoreByXml
//参数 DataSourceXmlNode:数据源节点，这里一般指DATASET节点;   DefineXml是定义RECORD的XML文本
function GenerateStoreByXml(DataSourceXmlNode,DefineXml)
{

	var nodes=DataSourceXmlNode.selectNodes("Table");
	/*var storeid;*/
	/*if(DataSourceXmlNode.selectSingleNode("@id"))
	{
	storeid=DataSourceXmlNode.selectSingleNode("@id").value;
	}*/
	var config={};
	if(DataSourceXmlNode.selectSingleNode("@id"))
	{
		config.id=DataSourceXmlNode.selectSingleNode("@id").value;
	}

	var storeid=DataSourceXmlNode.selectSingleNode("@id").value;
	var myreader=new Ext.data.XmlReader({root:'Table'},GetRecordDefineByDefineXml(DefineXml));
	config.reader=myreader;
	var mystore=new Ext.data.Store(config);
	/*if(storeid)
	{mystore.id=storeid}*/
	// create the Data Store
	for(var i=0;i<nodes.length;i++)
	{
		var record=GenerateRecordByXml(nodes[i],DefineXml);
		mystore.add(record);
	}
	return mystore;
}
//根据recordDefine和数据源XML生成一个Store对象，主要被GenerateStoreByXml
//参数 DataSourceXmlNode:数据源节点，这里一般指DATASET节点;   DefineXml是定义RECORD的XML文本
function GenerateStoreByXml2(DataSourceXmlNode,recordDefine)
{
	var nodes=DataSourceXmlNode.selectNodes("Table");
	//var storeid=DataSourceXmlNode.selectSingleNode("@id").value;
	/*if(DataSourceXmlNode.selectSingleNode("@id"))
	{
	storeid=DataSourceXmlNode.selectSingleNode("@id").value;
	}*/
	var config={};
	if(DataSourceXmlNode.selectSingleNode("@id"))
	{
		config.id=DataSourceXmlNode.selectSingleNode("@id").value;
	}
	var DefineXml=CreateDefineXmlByRecordDefine(recordDefine);
	var myreader=new Ext.data.XmlReader({root:'Table'},recordDefine);
	config.reader=myreader;
	var mystore=new Ext.data.Store(config);
	/* if(storeid)
	{mystore.id=storeid}*/
	// create the Data Store
	for(var i=0;i<nodes.length;i++)
	{
		var record=GenerateRecordByXml(nodes[i],DefineXml);
		mystore.add(record);
	}
	return mystore;
}
//-------STORE和RECORD的封装部分结束
//-----以下是对FIELD类型控件的封装
function GenerateTextFieldConfigByXmlDefine(pid,DefineXmlNode)
{

	var attrs=DefineXmlNode.selectSingleNode("Attributes");
	var configattr={};
	//ar StoreID=pid+"_"+attrs.selectSingleNode("StoreID").text;//这里要处理，STOREID不一定是必选项
	//var FieldIndex=attrs.selectSingleNode("FieldIndex").text;//这里要处理，FieldIndex不一定是必选项
	if(DefineXmlNode.getAttribute("id"))
	{
		configattr.id=pid+"_"+DefineXmlNode.getAttribute("id");
	}
	//以下这个属性是绑上去的,到时候是在绑定到主STORE具体FIELD的时候用的
	if(attrs.selectSingleNode("fieldIndex")!=null&&attrs.selectSingleNode("fieldIndex").text!="")
	{

		configattr.fieldIndex=attrs.selectSingleNode("fieldIndex").text;
	}

	if(attrs.selectSingleNode("fieldLabel")!=null&&attrs.selectSingleNode("fieldLabel").text!="")
	{
		configattr.fieldLabel=attrs.selectSingleNode("fieldLabel").text;
	}
	if(attrs.selectSingleNode("grow")!=null&&attrs.selectSingleNode("grow").text!="")
	{
		configattr.grow=myBool(attrs.selectSingleNode("grow").text);
	}
	if(attrs.selectSingleNode("growMin")!=null&&attrs.selectSingleNode("growMin").text!="")
	{
		configattr.growMin=parseInt(attrs.selectSingleNode("growMin").text);
	}
	if(attrs.selectSingleNode("growMax")!=null&&attrs.selectSingleNode("growMax").text!="")
	{
		configattr.growMax=parseInt(attrs.selectSingleNode("growMax").text);
	}
	if(attrs.selectSingleNode("vtype")!=null&&attrs.selectSingleNode("vtype").text!="")
	{
		configattr.vtype=attrs.selectSingleNode("vtype").text;
	}
	if(attrs.selectSingleNode("allowBlank")!=null&&attrs.selectSingleNode("allowBlank").text!="")
	{
		configattr.allowBlank=myBool(attrs.selectSingleNode("allowBlank").text);
	}
	if(attrs.selectSingleNode("minLength")!=null&&attrs.selectSingleNode("minLength").text!="")
	{
		configattr.minLength=parseInt(attrs.selectSingleNode("minLength").text);
	}

	if(attrs.selectSingleNode("maxLength")!=null&&attrs.selectSingleNode("maxLength").text!="")
	{
		configattr.maxLength=parseInt(attrs.selectSingleNode("maxLength").text);
	}

	if(attrs.selectSingleNode("minLengthText")!=null&&attrs.selectSingleNode("minLengthText").text!="")
	{
		configattr.minLengthText=attrs.selectSingleNode("minLengthText").text;
	}

	if(attrs.selectSingleNode("maxLengthText")!=null&&attrs.selectSingleNode("maxLengthText").text!="")
	{
		configattr.maxLengthText=attrs.selectSingleNode("maxLengthText").text;
	}
	if(attrs.selectSingleNode("selectOnFocus")!=null&&attrs.selectSingleNode("selectOnFocus").text!="")
	{
		configattr.selectOnFocus=myBool(attrs.selectSingleNode("selectOnFocus").text);
	}
	if(attrs.selectSingleNode("queryParam")!=null&&attrs.selectSingleNode("queryParam").text!="")
	{
		configattr.queryParam=attrs.selectSingleNode("queryParam").text;
	}
	if(attrs.selectSingleNode("loadingText")!=null&&attrs.selectSingleNode("loadingText").text!="")
	{
		configattr.loadingText=attrs.selectSingleNode("loadingText").text;
	}
	if(attrs.selectSingleNode("blankText")!=null&&attrs.selectSingleNode("blankText").text!="")
	{
		configattr.blankText=attrs.selectSingleNode("blankText").text;
	}
	if(attrs.selectSingleNode("emptyText")!=null&&attrs.selectSingleNode("emptyText").text!="")
	{
		configattr.emptyText=attrs.selectSingleNode("emptyText").text;
	}
	if(attrs.selectSingleNode("invalidText")!=null&&attrs.selectSingleNode("invalidText").text!="")
	{
		configattr.invalidText=attrs.selectSingleNode("invalidText").text;
	}
	if(attrs.selectSingleNode("validateOnBlur")!=null&&attrs.selectSingleNode("validateOnBlur").text!="")
	{
		configattr.validateOnBlur=myBool(attrs.selectSingleNode("validateOnBlur").text);
	}
	if(attrs.selectSingleNode("validationDelay")!=null&&attrs.selectSingleNode("validationDelay").text!="")
	{
		configattr.validationDelay=parseInt(attrs.selectSingleNode("validationDelay").text);
	}
	if(attrs.selectSingleNode("msgTarget")!=null&&attrs.selectSingleNode("msgTarget").text!="")
	{
		configattr.msgTarget=attrs.selectSingleNode("msgTarget").text;
	}
	if(attrs.selectSingleNode("readOnly")!=null&&attrs.selectSingleNode("readOnly").text!="")
	{
		configattr.readOnly=myBool(attrs.selectSingleNode("readOnly").text);
	}
	if(attrs.selectSingleNode("disabled")!=null&&attrs.selectSingleNode("disabled").text!="")
	{
		configattr.disabled=myBool(attrs.selectSingleNode("disabled").text);
	}
	if(attrs.selectSingleNode("inputType")!=null&&attrs.selectSingleNode("inputType").text!="")
	{
		configattr.inputType=attrs.selectSingleNode("inputType").text;
	}
	if(attrs.selectSingleNode("height")!=null&&attrs.selectSingleNode("height").text!="")
	{
		configattr.height=parseInt(attrs.selectSingleNode("height").text);
	}
	if(attrs.selectSingleNode("width")!=null&&attrs.selectSingleNode("width").text!="")
	{
		configattr.width=parseInt(attrs.selectSingleNode("width").text);
	}
	if(attrs.selectSingleNode("renderTo")!=null&&attrs.selectSingleNode("renderTo").text!="")
	{
		configattr.willrenderTo=attrs.selectSingleNode("renderTo").text;
	}

	return configattr;
}

//生成ComboBox配置项,继承TEXTFIELD配置项，还有其他东西要调试,比如QUERY等属性，还有REMOTE和LOCAL的
function GenerateComboboxConfigByXmlDefine(pid,DefineXmlNode)
{
	var configattr=GenerateTextFieldConfigByXmlDefine(pid,DefineXmlNode);
	var attrs=DefineXmlNode.selectSingleNode("Attributes");
	if(attrs.selectSingleNode("DatSourceUrl")!=null&&attrs.selectSingleNode("DatSourceUrl").text!="")
	{
		configattr.DatSourceUrl=attrs.selectSingleNode("DatSourceUrl").text;
	}
	if(attrs.selectSingleNode("transform")!=null&&attrs.selectSingleNode("transform").text!="")
	{
		configattr.transform=attrs.selectSingleNode("transform").text;
	}
	if(attrs.selectSingleNode("lazyRender")!=null&&attrs.selectSingleNode("lazyRender").text!="")
	{
		configattr.lazyRender=myBool(attrs.selectSingleNode("lazyRender").text);
	}
	//ComboBOX多一个STORE的定义，就是其下拉内容的STORE，其SOTREid和FIELDid还是指要保存的数据源
	//configattr.ShowStoreDefineID=attrs.selectSingleNode("StoreDefineID").text;
	if(attrs.selectSingleNode("title")!=null&&attrs.selectSingleNode("title").text!="")
	{
		configattr.title=attrs.selectSingleNode("title").text;
	}

	if(attrs.selectSingleNode("listWidth")!=null&&attrs.selectSingleNode("listWidth").text!="")
	{
		configattr.listWidth=parseInt(attrs.selectSingleNode("listWidth").text);
	}
	if(attrs.selectSingleNode("displayField")!=null&&attrs.selectSingleNode("displayField").text!="")
	{
		configattr.displayField=attrs.selectSingleNode("displayField").text;
	}

	if(attrs.selectSingleNode("valueField")!=null&&attrs.selectSingleNode("valueField").text!="")
	{
		configattr.valueField=attrs.selectSingleNode("valueField").text;
	}

	if(attrs.selectSingleNode("maxHeight")!=null&&attrs.selectSingleNode("maxHeight").text!="")
	{
		configattr.maxHeight=parseInt(attrs.selectSingleNode("maxHeight").text);
	}
	if(attrs.selectSingleNode("minChars")!=null&&attrs.selectSingleNode("minChars").text!="")
	{
		configattr.minChars=parseInt(attrs.selectSingleNode("minChars").text);
	}


	if(attrs.selectSingleNode("typeAhead")!=null&&attrs.selectSingleNode("typeAhead").text!="")
	{
		configattr.typeAhead=myBool(attrs.selectSingleNode("typeAhead").text);
	}


	if(attrs.selectSingleNode("queryDelay")!=null&&attrs.selectSingleNode("queryDelay").text!="")
	{
		configattr.queryDelay=parseInt(attrs.selectSingleNode("queryDelay").text);
	}

	if(attrs.selectSingleNode("pageSize")!=null&&attrs.selectSingleNode("pageSize").text!="")
	{
		configattr.pageSize=parseInt(attrs.selectSingleNode("pageSize").text);
	}


	if(attrs.selectSingleNode("editable")!=null&&attrs.selectSingleNode("editable").text!="")
	{
		configattr.editable=myBool(attrs.selectSingleNode("editable").text);
	}

	if(attrs.selectSingleNode("allQuery")!=null&&attrs.selectSingleNode("allQuery").text!="")
	{
		configattr.allQuery=attrs.selectSingleNode("allQuery").text;
	}


	if(attrs.selectSingleNode("mode")!=null&&attrs.selectSingleNode("mode").text!="")
	{
		configattr.mode=attrs.selectSingleNode("mode").text;
	}

	if(attrs.selectSingleNode("forceSelection")!=null&&attrs.selectSingleNode("forceSelection").text!="")
	{
		configattr.forceSelection=myBool(attrs.selectSingleNode("forceSelection").text);
	}
	if(attrs.selectSingleNode("typeAheadDelay")!=null&&attrs.selectSingleNode("typeAheadDelay").text!="")
	{
		configattr.typeAheadDelay=parseInt(attrs.selectSingleNode("typeAheadDelay").text);
	}

	if(attrs.selectSingleNode("valueNotFoundText")!=null&&attrs.selectSingleNode("valueNotFoundText").text!="")
	{
		configattr.valueNotFoundText=attrs.selectSingleNode("valueNotFoundText").text;
	}
	if(attrs.selectSingleNode("lazyInit")!=null&&attrs.selectSingleNode("lazyInit").text!="")
	{
		configattr.lazyInit=myBool(attrs.selectSingleNode("lazyInit").text);
	}
	return configattr;
}
//获取NUMBERFIELD的配置项,继承TEXTFIELD配置项
function GenerateNumberFieldConfigByXmlDefine(pid,DefineXmlNode)
{
	var configattr=GenerateTextFieldConfigByXmlDefine(pid,DefineXmlNode);
	var attrs=DefineXmlNode.selectSingleNode("Attributes");

	if(attrs.selectSingleNode("allowDecimals")!=null&&attrs.selectSingleNode("allowDecimals").text!="")
	{
		configattr.allowDecimals=myBool(attrs.selectSingleNode("allowDecimals").text);
	}


	if(attrs.selectSingleNode("decimalSeparator")!=null&&attrs.selectSingleNode("decimalSeparator").text!="")
	{
		configattr.decimalSeparator=attrs.selectSingleNode("decimalSeparator").text;
	}


	if(attrs.selectSingleNode("decimalPrecision")!=null&&attrs.selectSingleNode("decimalPrecision").text!="")
	{
		configattr.decimalPrecision=parseInt(attrs.selectSingleNode("decimalPrecision").text);
	}


	if(attrs.selectSingleNode("allowNegative")!=null&&attrs.selectSingleNode("allowNegative").text!="")
	{
		configattr.allowNegative=myBool(attrs.selectSingleNode("allowNegative").text);
	}

	if(attrs.selectSingleNode("minValue")!=null&&attrs.selectSingleNode("minValue").text!="")
	{
		configattr.minValue=parseInt(attrs.selectSingleNode("minValue").text);
	}

	if(attrs.selectSingleNode("maxValue")!=null&&attrs.selectSingleNode("maxValue").text!="")
	{
		configattr.maxValue=parseInt(attrs.selectSingleNode("maxValue").text);
	}

	if(attrs.selectSingleNode("minText")!=null&&attrs.selectSingleNode("minText").text!="")
	{
		configattr.minText=attrs.selectSingleNode("minText").text;
	}
	if(attrs.selectSingleNode("maxText")!=null&&attrs.selectSingleNode("maxText").text!="")
	{
		configattr.maxText=attrs.selectSingleNode("maxText").text;
	}

	if(attrs.selectSingleNode("is")!=null&&attrs.selectSingleNode("is").text!="")
	{
		configattr.is=attrs.selectSingleNode("is").text;
	}
	return configattr;
}

//获取TextArea的配置项,继承TEXTFIELD配置项
function GenerateTextAreaConfigByXmlDefine(pid,DefineXmlNode)
{
	var configattr=GenerateTextFieldConfigByXmlDefine(pid,DefineXmlNode);
	var attrs=DefineXmlNode.selectSingleNode("Attributes");
	if(attrs.selectSingleNode("preventScrollbars")!=null&&attrs.selectSingleNode("preventScrollbars").text!="")
	{
		configattr.preventScrollbars=myBool(attrs.selectSingleNode("preventScrollbars").text);
	}
	return configattr;
}
//获取DateField的配置项,继承TEXTFIELD配置项
function GenerateDateFieldConfigByXmlDefine(pid,DefineXmlNode)
{
	var configattr=GenerateTextFieldConfigByXmlDefine(pid,DefineXmlNode);
	var attrs=DefineXmlNode.selectSingleNode("Attributes");
	if(attrs.selectSingleNode("format")!=null&&attrs.selectSingleNode("format").text!="")
	{
		configattr.format=attrs.selectSingleNode("format").text;
	}
	if(attrs.selectSingleNode("altFormats")!=null&&attrs.selectSingleNode("altFormats").text!="")
	{
		configattr.altFormats=attrs.selectSingleNode("altFormats").text;
	}
	if(attrs.selectSingleNode("minValue")!=null&&attrs.selectSingleNode("minValue").text!="")
	{
		configattr.minValue=attrs.selectSingleNode("minValue").text;
	}
	if(attrs.selectSingleNode("maxValue")!=null&&attrs.selectSingleNode("maxValue").text!="")
	{
		configattr.maxValue=attrs.selectSingleNode("maxValue").text;
	}
	if(attrs.selectSingleNode("minText")!=null&&attrs.selectSingleNode("minText").text!="")
	{
		configattr.minText=attrs.selectSingleNode("minText").text;
	}
	if(attrs.selectSingleNode("maxText")!=null&&attrs.selectSingleNode("maxText").text!="")
	{
		configattr.maxText=attrs.selectSingleNode("maxText").text;
	}
	if(attrs.selectSingleNode("invalidText")!=null&&attrs.selectSingleNode("invalidText").text!="")
	{
		configattr.invalidText=attrs.selectSingleNode("invalidText").text;
	}

	return configattr;
}
//获取TIMEFIELD的配置项，继承COMBOBOX配置项
function GenerateTimeFieldConfigByXmlDefine(pid,DefineXmlNode)
{
	var configattr=GenerateComboboxConfigByXmlDefine(pid,DefineXmlNode);
	var attrs=DefineXmlNode.selectSingleNode("Attributes");
	if(attrs.selectSingleNode("minValue")!=null&&attrs.selectSingleNode("minValue").text!="")
	{
		configattr.minValue=attrs.selectSingleNode("minValue").text;
	}
	if(attrs.selectSingleNode("maxValue")!=null&&attrs.selectSingleNode("maxValue").text!="")
	{
		configattr.maxValue=attrs.selectSingleNode("maxValue").text;
	}
	if(attrs.selectSingleNode("minText")!=null&&attrs.selectSingleNode("minText").text!="")
	{
		configattr.minText=attrs.selectSingleNode("minText").text;
	}
	if(attrs.selectSingleNode("maxText")!=null&&attrs.selectSingleNode("maxText").text!="")
	{
		configattr.maxText=attrs.selectSingleNode("maxText").text;
	}
	if(attrs.selectSingleNode("invalidText")!=null&&attrs.selectSingleNode("invalidText").text!="")
	{
		configattr.invalidText=attrs.selectSingleNode("invalidText").text;
	}
	if(attrs.selectSingleNode("format")!=null&&attrs.selectSingleNode("format").text!="")
	{
		configattr.format=attrs.selectSingleNode("format").text;
	}
	if(attrs.selectSingleNode("altFormats")!=null&&attrs.selectSingleNode("altFormats").text!="")
	{
		configattr.altFormats=attrs.selectSingleNode("altFormats").text;
	}
	if(attrs.selectSingleNode("increment")!=null&&attrs.selectSingleNode("increment").text!="")
	{
		configattr.increment=parseIntattrs.selectSingleNode("increment").text;
	}
	return configattr;
}

//在这里将FIELD与DATAFIELD关联起来，具体做法是如果该STORE的FIELD存在，就绑到CONTROL的FIELD上（如果没有要处理一下，是新建还是报警？），并且在FIELD值变化后的事件去写FIELD对应的STORE的item[0]里对应FIELD的

function YCField(pid,DefineXmlNode,fieldtype)
{

	switch(fieldtype)
	{
		case "TextField":config=GenerateTextFieldConfigByXmlDefine(pid,DefineXmlNode);break;
		case "ComboBox":config=GenerateComboboxConfigByXmlDefine(pid,DefineXmlNode);break;
		case "TextArea":config=GenerateTextAreaConfigByXmlDefine(pid,DefineXmlNode);break;
		case "NumberField":config=GenerateNumberFieldConfigByXmlDefine(pid,DefineXmlNode);break;
		case "TimeField":config=GenerateTimeFieldConfigByXmlDefine(pid,DefineXmlNode);break;
		case "DateField":config=GenerateDateFieldConfigByXmlDefine(pid,DefineXmlNode);break;
		default:break;
	}
	var vfieldobj;
	if(fieldtype=="ComboBox")
	{
		if(!config.DatSourceUrl)
		{
			alert("comboBox_ID:"+config.id+"的DatSourceUrl没有设置!");
		}
		var combosource = new Ext.data.Store({
			url: config.DatSourceUrl,
			autoLoad: false, // required for the combo that does not use Ajax
			reader: new Ext.data.XmlReader(
			{ record: 'Table'},
			[{name:config.displayField },{name:config.valueField}]
			)
		});
		config.mode='local';
		config.store=combosource;
		var comboLocal = new Ext.form.ComboBox(config);
		vfieldobj=comboLocal;

	}
	//alert(vfieldobj.store);

	switch(fieldtype)
	{
		case "TextField":vfieldobj=new Ext.form.TextField(config);break;
		//case "ComboBox":vfieldobj=new Ext.form.ComboBox(config);break;
		case "TextArea":vfieldobj=new Ext.form.TextArea(config);break;
		case "NumberField":vfieldobj=new Ext.form.NumberField(config);break;
		case "TimeField":vfieldobj=new Ext.form.TimeField(config);break;
		case "DateField":vfieldobj=new Ext.form.DateField(config);break;
		default:break;
	}

	function YCFieldDataBind(store)
	{
		if(!vfieldobj.fieldIndex)
		{return;}
		var fieldname=vfieldobj.fieldIndex;

		if(!store.data.items[0].data[fieldname])
		{
			alert("控件ID:"+vfieldobj.id+"指定要绑定的field="+fieldname+"在MAIN定义中不存在!");
			return;
		}
		if(vfieldobj.getXType()=="combo")
		{

			vfieldobj.store.load();

			var isExsit=vfieldobj.selectByValue(store.data.items[0].data[fieldname],false);
			if(!isExsit)
			{//这里表示是手工输入的
				if(store.data.items[0].data[fieldname+"_text"])
				{
					vfieldobj.setValue(store.data.items[0].data[fieldname+"_text"])
				}
				else
				{  vfieldobj.setValue(store.data.items[0].data[fieldname]);}
			};

			vfieldobj.un('blur',onblur);
			vfieldobj.on('blur',onblur);

			function onblur(vfieldobj)
			{

				/*var store=vfieldobj.store;
				store.data.items[0].data[fieldname]=vfieldobj.getValue();
				var isExsit=vfieldobj.selectByValue(store.data.items[0].data[fieldname],false);
				if(isExsit)//表示是列表中的
				{
				store.data.items[0].data[fieldname]=vfieldobj.getValue();
				}
				else
				{
				var textvalue=Ext.get(vfieldobj.id).dom.value;
				if(store.data.items[0].data[fieldname+"_text"])
				{
				store.data.items[0].data[fieldname+"_text"]=textvalue;
				store.data.items[0].data[fieldname]="";
				}
				else
				{
				store.data.items[0].data[fieldname]=textvalue;
				}
				}
				vfieldobj.isNotSelect=true;*/
			}
		}
		else
		{vfieldobj.setValue(store.data.items[0].data[fieldname]);};

		vfieldobj.un('change',changedata);
		vfieldobj.on('change',changedata);

		function changedata(vfieldobj,newvalue,oldvalue)
		{
			store.data.items[0].data[fieldname]=newvalue;
		}
	}
	this.UnBindData=function(store)
	{
		vfieldobj.purgeListeners();
	};
	this.BindData=function(store)
	{
		YCFieldDataBind(store)
	};
	this.Render=function()
	{
		if(Ext.get(vfieldobj.willrenderTo))
		{
			vfieldobj.render(vfieldobj.willrenderTo);
		}
		else
		{
			alert(vfieldobj.id+"的renderTo对象:"+vfieldobj.willrenderTo+"不存在!");
		}
//		if(vfieldobj.getXType()=="combo")
//		{

//		}
	}
	vfieldobj.ycgenerate=this;
	this.getControl=function()
	{return vfieldobj;}
}
//-----对FIELD类型控件的封装/结束
//根据一个列定义节点返回一个列的JASONCONFIG
function GenerateColumnByXmlDefine(ColumnXmlDefineNode)
{
	var data;
	var Type=ColumnXmlDefineNode.selectSingleNode("@Type");
	var ColType="";
	data={};
	if(Type!=null)
	{
		ColType=Type.value;
	}
	if(ColumnXmlDefineNode.selectSingleNode("header")!=null&&ColumnXmlDefineNode.selectSingleNode("header").text!="")
	{
		data.header=ColumnXmlDefineNode.selectSingleNode("header").text;
	}
	if(ColumnXmlDefineNode.selectSingleNode("dataIndex")!=null&&ColumnXmlDefineNode.selectSingleNode("dataIndex").text!="")
	{
		data.dataIndex=ColumnXmlDefineNode.selectSingleNode("dataIndex").text;
	}
	if(ColumnXmlDefineNode.selectSingleNode("width")!=null&&ColumnXmlDefineNode.selectSingleNode("width").text!="")
	{
		data.width=parseInt(ColumnXmlDefineNode.selectSingleNode("width").text);
	}
	if(ColumnXmlDefineNode.selectSingleNode("sortable")!=null&&ColumnXmlDefineNode.selectSingleNode("sortable").text!="")
	{
		data.sortable=myBool(ColumnXmlDefineNode.selectSingleNode("sortable").text);
	}
	if(ColumnXmlDefineNode.selectSingleNode("locked")!=null&&ColumnXmlDefineNode.selectSingleNode("locked").text!="")
	{
		data.locked=myBool(ColumnXmlDefineNode.selectSingleNode("locked").text);
	}
	if(ColumnXmlDefineNode.selectSingleNode("resizable")!=null&&ColumnXmlDefineNode.selectSingleNode("resizable").text!="")
	{
		data.resizable=myBool(ColumnXmlDefineNode.selectSingleNode("resizable").text);
	}
	if(ColumnXmlDefineNode.selectSingleNode("hidden")!=null&&ColumnXmlDefineNode.selectSingleNode("hidden").text!="")
	{
		data.hidden=myBool(ColumnXmlDefineNode.selectSingleNode("hidden").text);
	}
	if(ColumnXmlDefineNode.selectSingleNode("myrenderer")!=null&&ColumnXmlDefineNode.selectSingleNode("myrenderer").text!="")
	{
		data.myrenderer=ColumnXmlDefineNode.selectSingleNode("myrenderer").text;
	}
	if(ColumnXmlDefineNode.selectSingleNode("align")!=null&&ColumnXmlDefineNode.selectSingleNode("align").text!="")
	{
		data.align=ColumnXmlDefineNode.selectSingleNode("align").text;
	}
	if(ColumnXmlDefineNode.selectSingleNode("hideable")!=null&&ColumnXmlDefineNode.selectSingleNode("hideable").text!="")
	{
		data.hideable=myBool(ColumnXmlDefineNode.selectSingleNode("hideable").text);
	}

	if(ColumnXmlDefineNode.selectSingleNode("editor")!=null&&ColumnXmlDefineNode.selectSingleNode("editor").text!="")
	{
		var editor=ColumnXmlDefineNode.selectSingleNode("editor").text;
		if(editor=="default")//Editor节点下应该放CONTROL节点的定义,然后把节点传入控件生成器生成返回后
		{
			data.editor=new Ext.form.TextField({});
		}
		else
		{
			var fieldtype=ColumnXmlDefineNode.selectSingleNode("editor").selectSingleNode("Control").childNodes[0].nodeName;
			data.editor=GetEditor(ColumnXmlDefineNode.selectSingleNode("editor").selectSingleNode("Control").childNodes[0]);
			if(fieldtype=="NumberField")
			{
				if(data.myrenderer=="RMB")
				{
					data.renderer=function(v,p,record){return RMBMoney(v)};
				}
				if(data.myrenderer=="rmb")
				{
					data.renderer=function(v,p,record){return rmbMoney(v)};
				}
				if(data.myrenderer=="USD")
				{
					data.renderer="usMoney";
				}
			}
			if(fieldtype=="DateField")
			{
				if(data.myrenderer=="date")
				{
					data.renderer=function formatDate(v){
					return v ? v.dateFormat('Y-m-d') : '';};
				}
				if(data.myrenderer=="DATE")
				{
					data.renderer=function formatDate(v){
						return v ? v.dateFormat('Y年m月d日') : '';
					};
				}
			}
			if(fieldtype=="ComboBox")
			{

				data.renderer=function formatDate(v,p,record)
				{

					if(record.data[data.dataIndex+"_text"]&&record.data[data.dataIndex+"_text"]!="")
					{
						//return record.data[data.dataIndex];
						return record.data[data.dataIndex+"_text"];
					}
					else
					{
						return record.data[data.dataIndex];
					}
				};
			}
		}
	}
	if(ColumnXmlDefineNode.selectSingleNode("hasSub")!=null&&ColumnXmlDefineNode.selectSingleNode("hasSub").text!="")
	{
		/*var hasSub=myBool(ColumnXmlDefineNode.selectSingleNode("hasSub").text);
		if(hasSub)
		{
		data.editor.on("focus",OnFocus,data.editor);
		data.editor.un("blur",OnBlur,data.editor);
		}*/
	}


	function GetEditor(DefineXmlNode)
	{

		fieldtype=DefineXmlNode.nodeName;
		var pid="";
		switch(fieldtype)
		{
			case "TextField":config=GenerateTextFieldConfigByXmlDefine(pid,DefineXmlNode);break;
			case "ComboBox":config=GenerateComboboxConfigByXmlDefine(pid,DefineXmlNode);break;
			case "TextArea":config=GenerateTextAreaConfigByXmlDefine(pid,DefineXmlNode);break;
			case "NumberField":config=GenerateNumberFieldConfigByXmlDefine(pid,DefineXmlNode);break;
			case "TimeField":config=GenerateTimeFieldConfigByXmlDefine(pid,DefineXmlNode);break;
			case "DateField":config=GenerateDateFieldConfigByXmlDefine(pid,DefineXmlNode);break;
			default:break;
		}
		var vfieldobj;
		if(fieldtype=="ComboBox")
		{
			if(!config.DatSourceUrl)
			{
				alert("Editor中的comboBox_ID:"+config.id+"的DatSourceUrl没有设置!");
			}
			var combosource = new Ext.data.Store({
				url: config.DatSourceUrl,
				autoLoad: true, // required for the combo that does not use Ajax
				reader: new Ext.data.XmlReader(
				{ record: 'Table'},
				[{name:config.displayField },{name:config.valueField}]
				)
			});
			config.mode='local';
			config.store=combosource;
			var comboLocal = new Ext.form.ComboBox(config);
			vfieldobj=comboLocal;
		}
		switch(fieldtype)
		{
			case "TextField":vfieldobj=new Ext.form.TextField(config);break;
			case "TextArea":vfieldobj=new Ext.form.TextArea(config);break;
			case "NumberField":vfieldobj=new Ext.form.NumberField(config);break;
			case "TimeField":vfieldobj=new Ext.form.TimeField(config);break;
			case "DateField":vfieldobj=new Ext.form.DateField(config);break;
			default:break;
		}
		return vfieldobj;
	}
	/*if(ColType=="check")
	{
	data=checkColumn;
	//data.renderer=new fm.Checkbox({});
	}*/

	return data;
}
////根据一个COLUMNS定义的XMLNODE返回一个COLUMNModel对象
function GenerateColumnModelByXmlDefine(XmlColumnsDefine)
{

	var cols=XmlColumnsDefine.selectNodes("Column");

	var ColArray=new Array();

	for(var i=0;i<cols.length;i++)
	{
		ColArray[i]=GenerateColumnByXmlDefine(cols[i]);
	}

	var cm=new Ext.grid.ColumnModel(ColArray);
	return cm;
}
//-----------------------

//根据一个GRID的定义返回一个GRID对象EDITGRIDPANEL,如果有PLUGINS必须现在传
function GenerateGridByXmlDefine(pid,DefineXmlNode,gridPlugins)
{
	var attrs=DefineXmlNode.selectSingleNode("Attributes");
	var configattr={};

	if(DefineXmlNode.getAttribute("id"))
	{
		configattr.id=pid+"_"+DefineXmlNode.getAttribute("id");
	}

	if(attrs.selectSingleNode("StoreDefineID")!=null&&attrs.selectSingleNode("StoreDefineID").text!="")
	{
		configattr.StoreDefineID=attrs.selectSingleNode("StoreDefineID").text;
	}
	if(attrs.selectSingleNode("StoreID")!=null&&attrs.selectSingleNode("StoreID").text!="")
	{
		configattr.StoreID=attrs.selectSingleNode("StoreID").text;
	}
	if(attrs.selectSingleNode("enableAdd")!=null&&attrs.selectSingleNode("enableAdd").text!="")
	{
		configattr.enableAdd=attrs.selectSingleNode("enableAdd").text;
	}
	if(attrs.selectSingleNode("clicksToEdit")!=null&&attrs.selectSingleNode("clicksToEdit").text!="")
	{
		configattr.clicksToEdit=parseInt(attrs.selectSingleNode("clicksToEdit").text);
	}
	if(attrs.selectSingleNode("maxHeight")!=null&&attrs.selectSingleNode("maxHeight").text!="")
	{
		configattr.maxHeight=parseInt(attrs.selectSingleNode("maxHeight").text);
	}
	if(attrs.selectSingleNode("disableSelection")!=null&&attrs.selectSingleNode("disableSelection").text!="")
	{
		configattr.disableSelection=myBool(attrs.selectSingleNode("disableSelection").text);
	}
	if(attrs.selectSingleNode("enableColumnMove")!=null&&attrs.selectSingleNode("enableColumnMove").text!="")
	{
		configattr.enableColumnMove=myBool(attrs.selectSingleNode("enableColumnMove").text);
	}
	if(attrs.selectSingleNode("enableColumnResize")!=null&&attrs.selectSingleNode("enableColumnResize").text!="")
	{
		configattr.enableColumnResize=myBool(attrs.selectSingleNode("enableColumnResize").text);
	}
	if(attrs.selectSingleNode("minColumnWidth")!=null&&attrs.selectSingleNode("minColumnWidth").text!="")
	{
		configattr.minColumnWidth=parseInt(attrs.selectSingleNode("minColumnWidth").text);
	}
	if(attrs.selectSingleNode("autoSizeColumns")!=null&&attrs.selectSingleNode("autoSizeColumns").text!="")
	{
		configattr.autoSizeColumns=myBool(attrs.selectSingleNode("autoSizeColumns").text);
	}
	if(attrs.selectSingleNode("autoSizeHeaders")!=null&&attrs.selectSingleNode("autoSizeHeaders").text!="")
	{
		configattr.autoSizeHeaders=myBool(attrs.selectSingleNode("autoSizeHeaders").text);
	}
	if(attrs.selectSingleNode("monitorWindowResize")!=null&&attrs.selectSingleNode("monitorWindowResize").text!="")
	{
		configattr.monitorWindowResize=myBool(attrs.selectSingleNode("monitorWindowResize").text);
	}
	if(attrs.selectSingleNode("maxRowsToMeasure")!=null&&attrs.selectSingleNode("maxRowsToMeasure").text!="")
	{
		configattr.maxRowsToMeasure=parseInt(attrs.selectSingleNode("maxRowsToMeasure").text);
	}
	if(attrs.selectSingleNode("trackMouseOver")!=null&&attrs.selectSingleNode("trackMouseOver").text!="")
	{
		configattr.trackMouseOver=myBool(attrs.selectSingleNode("trackMouseOver").text);
	}
	if(attrs.selectSingleNode("enableDragDrop")!=null&&attrs.selectSingleNode("enableDragDrop").text!="")
	{
		configattr.enableDragDrop=myBool(attrs.selectSingleNode("enableDragDrop").text);
	}
	if(attrs.selectSingleNode("enableColumnHide")!=null&&attrs.selectSingleNode("enableColumnHide").text!="")
	{
		configattr.enableColumnHide=myBool(attrs.selectSingleNode("enableColumnHide").text);
	}

	if(attrs.selectSingleNode("enableRowHeightSync")!=null&&attrs.selectSingleNode("enableRowHeightSync").text!="")
	{
		configattr.enableRowHeightSync=myBool(attrs.selectSingleNode("enableRowHeightSync").text);
	}

	if(attrs.selectSingleNode("stripeRows")!=null&&attrs.selectSingleNode("stripeRows").text!="")
	{
		configattr.stripeRows=myBool(attrs.selectSingleNode("stripeRows").text);
	}

	if(attrs.selectSingleNode("autoHeight")!=null&&attrs.selectSingleNode("autoHeight").text!="")
	{
		configattr.autoHeight=myBool(attrs.selectSingleNode("autoHeight").text);
	}

	if(attrs.selectSingleNode("frame")!=null&&attrs.selectSingleNode("frame").text!="")
	{
		configattr.frame=myBool(attrs.selectSingleNode("frame").text);
	}

	if(attrs.selectSingleNode("autoExpandColumn")!=null&&attrs.selectSingleNode("autoExpandColumn").text!="")
	{
		configattr.autoExpandColumn=attrs.selectSingleNode("autoExpandColumn").text;
	}

	if(attrs.selectSingleNode("autoExpandMin")!=null&&attrs.selectSingleNode("autoExpandMin").text!="")
	{
		configattr.autoExpandMin=parseInt(attrs.selectSingleNode("autoExpandMin").text);
	}
	if(attrs.selectSingleNode("autoExpandMax")!=null&&attrs.selectSingleNode("autoExpandMax").text!="")
	{
		configattr.autoExpandMax=parseInt(attrs.selectSingleNode("autoExpandMax").text);
	}

	if(attrs.selectSingleNode("loadMask")!=null&&attrs.selectSingleNode("loadMask").text!="")
	{
		configattr.loadMask=myBool(attrs.selectSingleNode("loadMask").text);
	}


	if(attrs.selectSingleNode("header")!=null&&attrs.selectSingleNode("header").text!="")
	{
		configattr.header=myBool(attrs.selectSingleNode("header").text);
	}

	if(attrs.selectSingleNode("footer")!=null&&attrs.selectSingleNode("footer").text!="")
	{
		configattr.footer=myBool(attrs.selectSingleNode("footer").text);
	}

	if(attrs.selectSingleNode("title")!=null&&attrs.selectSingleNode("title").text!="")
	{
		configattr.title=attrs.selectSingleNode("title").text;
	}

	if(attrs.selectSingleNode("bodyBorder")!=null&&attrs.selectSingleNode("bodyBorder").text!="")
	{
		configattr.bodyBorder=myBool(attrs.selectSingleNode("bodyBorder").text);
	}

	if(attrs.selectSingleNode("collapsible")!=null&&attrs.selectSingleNode("collapsible").text!="")
	{
		configattr.collapsible=myBool(attrs.selectSingleNode("collapsible").text);
	}

	if(attrs.selectSingleNode("html")!=null&&attrs.selectSingleNode("html").text!="")
	{
		configattr.html=attrs.selectSingleNode("html").text;
	}

	if(attrs.selectSingleNode("draggable")!=null&&attrs.selectSingleNode("draggable").text!="")
	{
		configattr.draggable=myBool(attrs.selectSingleNode("draggable").text);
	}

	if(attrs.selectSingleNode("buttonAlign")!=null&&attrs.selectSingleNode("buttonAlign").text!="")
	{
		configattr.buttonAlign=attrs.selectSingleNode("buttonAlign").text;
	}

	if(attrs.selectSingleNode("collapsed")!=null&&attrs.selectSingleNode("collapsed").text!="")
	{
		configattr.collapsed=myBool(attrs.selectSingleNode("collapsed").text);
	}

	if(attrs.selectSingleNode("autoWidth")!=null&&attrs.selectSingleNode("autoWidth").text!="")
	{
		configattr.autoWidth=myBool(attrs.selectSingleNode("autoWidth").text);
	}

	if(attrs.selectSingleNode("deferHeight")!=null&&attrs.selectSingleNode("deferHeight").text!="")
	{
		configattr.deferHeight=myBool(attrs.selectSingleNode("deferHeight").text);
	}

	if(attrs.selectSingleNode("height")!=null&&attrs.selectSingleNode("height").text!="")
	{
		configattr.height=parseInt(attrs.selectSingleNode("height").text);
	}

	if(attrs.selectSingleNode("width")!=null&&attrs.selectSingleNode("width").text!="")
	{
		configattr.width=parseInt(attrs.selectSingleNode("width").text);
	}
	if(attrs.selectSingleNode("renderTo")!=null&&attrs.selectSingleNode("renderTo").text!="")
	{
		configattr.willrenderTo=attrs.selectSingleNode("renderTo").text;
	}

	var mycm=GenerateColumnModelByXmlDefine(DefineXmlNode.selectSingleNode("Columns"));

	configattr.cm=mycm;
	var selectionModel=new Ext.grid.CheckboxSelectionModel();

	var addButton={
		text: 'AddNewRow',
		handler : function(){
			var gridstore=mygrid.store;
			var p = CreateBlankRecord(gridstore.DefineXml);
			mygrid.stopEditing();
			gridstore.insert(0, p);
			mygrid.startEditing(0, 0);
			mygrid.getView().refresh();
			//store.commitChanges();
		}
	};
	var deleteButton={
		text: 'DeleteRow',
		handler : function(){
			var gridstore=mygrid.store;

			var row=mygrid.getSelectionModel().getSelections();
			for(var i=0;i<row.length;i++)
			{
				gridstore.remove(row[i]);
			}
			mygrid.getView().refresh();
		}
	};
	var myTopBar=Array();
	if(configattr.enableAdd)
	{
		myTopBar.unshift(deleteButton);
		myTopBar.unshift(addButton);
		configattr.sm=selectionModel;
		mycm.config.unshift(selectionModel);
	}
	//定义按钮
	configattr.tbar=myTopBar;

	if(gridPlugins!=null)
	{
		configattr.plugins=gridPlugins;//checkColumn
	}

	var mygrid = new Ext.grid.EditorGridPanel(configattr);
	mygrid.ycgenerate=this;
	//alert(mygrid.id);
	mygrid.on("validateedit",forcombobox);//为了放comboEDITOR的textFIELD
	function forcombobox(e)
	{
		var cm=mygrid.colModel;
		if(e.record.data[e.field+"_text"]!=null&&e.record.data[e.field+"_text"]!="undefine")
		{
			var editor=cm.getCellEditor(e.column,e.row);
			e.record.data[e.field+"_text"]=Ext.get(editor.field.id).dom.value;
		}
	}
	this.UnBindData=function()
	{
	};
	this.BindData=function(mystore)
	{
		var flag=mygrid.store;

		if(mygrid.getEl())
		{
			mygrid.reconfigure(mystore,mygrid.colModel);
			//jiaokun这里要非常注意，只是通过mygrid.store=mystore是不行的，会造成问题，必须用RECONFIGURE
		}
		else
		{
			mygrid.store=mystore;
		}
	};

	this.BindXmlData=function(xml)
	{
		var recordDefine=GetRecordDefineByGridCM(mygrid.colModel);
		var xdoc=XmlDocument();
		xdoc.loadXML(xml);

		var store=GenerateStoreByXml2(xdoc.selectSingleNode("//NewDataSet"),recordDefine);
		if(mygrid.getEl())
		{
			mygrid.reconfigure(store,mygrid.colModel);
			//jiaokun这里要非常注意，只是通过mygrid.store=mystore是不行的，会造成问题，必须用RECONFIGURE
		}
		else
		{
			mygrid.store=store;
		}
	}

	this.Render=function()
	{

		if(Ext.get(mygrid.willrenderTo))
		{
			mygrid.render(mygrid.willrenderTo);
			mygrid.getView().refresh();
			//mygrid.reconfigure(mygrid.store)
		}
		else
		{
			alert(mygrid.id+"的renderTo对象:"+mygrid.willrenderTo+"不存在!");
		}
	}

	//jiaokun外部可以用mygrid.colModel.setEditor(getColumnById());包括GET\SET EDITOR,RENDERER
	//以下是重新设置EDITOR的例子！！！！！！！！！！！！！！！！！！
	/*var mygrid=GenerateGridByXmlDefine(xdoc.selectSingleNode("//Grid"),checkColumn);*/
	/*var datetime=new fm.DateField({
	format: 'm/d/y',
	minValue: '01/01/06',
	disabledDays: [0, 6],
	disabledDaysText: 'Plants are not available on the weekends'
	});
	var editor=new Ext.grid.GridEditor(datetime);
	mygrid.colModel.setEditor(4,editor);*/
	this.getControl=function()
	{return mygrid;}
}

//--------------以下是为了即时后台调用做的封装--------------------//
//根据一个GRID的COLUMN定义生成RECORD的定义
function GetRecordDefineByGridCM(cm)
{
	var configarr=new Array();
	for(var i=0;i<cm.config.length;i++)
	{
		var config={};
		var textconfig={};
		if(cm.config[i].dataIndex!=null&&cm.config[i].dataIndex!="")
		{
			config.name=cm.config[i].dataIndex;
			config.type="string";
			if(cm.config[i].editor)
			{

				if(cm.config[i].editor.field.getXType()=="datefield")
				{config.type="date";config.dateFormat='Y-m-d';}
				if(cm.config[i].editor.field.getXType()=="numberfield")
				{config.type="float";}
				if(cm.config[i].editor.field.getXType()=="combo")
				{
					textconfig.name=config.name+"_text";
					textconfig.type="string";
					configarr.push(textconfig);
				}
			}
			configarr.push(config);
		}
	}
	var recorddefine=Ext.data.Record.create(configarr);
	return recorddefine;
}

function __refreshMenuCount() {
    var url = "/MenuCountHandler.ashx";
	var request = __createRquest();
	request.open("POST", url, false);
	request.send("");
	if (request.readyState == 4) {
		if (request.status == 200) {
			var returnValue = request.responseText;
			var infoArr = returnValue.split("##");
			for (var i = 0; i < infoArr.length; i++) {
				infoArr[i] = infoArr[i].split("|");
			}
			Ext.getCmp('west-panel').el.select('li.x-tree-node div.x-tree-node-el').each(function(item){
				var itemEl = Ext.get(item);
				var itemId = itemEl.getAttributeNS('ext','tree-node-id');
				for (var j = 0; j < infoArr.length; j++) {
					if(itemId == infoArr[j][0]){
						var itemTextEl = itemEl.child('a.x-tree-node-anchor span');
						itemTextEl.dom.innerHTML = infoArr[j][1] + "[" + infoArr[j][2] + "]";
						if (infoArr[j][2] != "0") {
							itemTextEl.dom.style.fontWeight = "bold";
						} else {
							itemTextEl.dom.style.fontWeight = "";
						}
					}
					itemEl.select('a.x-tree-node-anchor span')
				}
			},this);
		}
	}
	request.abort();
}

var ChildeNodesCount__Start__ = 0;
var ChildeNodesCount__End__ = 0;
function __createRquest() {
	var __httpRequest = null;

	try {
		__httpRequest = new XMLHttpRequest();

	} catch (e) {
		try {
			__httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e1) {
			__httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	return __httpRequest;
}