if(!UBI || !UBI.EmpInfo)
{
	UBI = {};
	UBI.EmpInfo ={Emp_Id: 'zzt', Emp_Name: '答复', Emp_AD_Account: 'ad112'};	
	UBI.currentForm = {procname: '测试流程',actname:'节点A', urlInfo:{} };
	UBI.currentForm.urlInfo = {viewStatus: 'viewStatus', procinstid:123, sn: '123_1', draftid:'asdwwewe', smdName:'测试流程_Smd'};
}
var EventCodeGen = {};
EventCodeGen.Gen = function () {
	var w =new Ext.Window({
	   title:"选择",
	   modal:true,
	   width:900,
	   height:700,
	   layout:"form",
	   lableWidth:45,
	   defaults:{xtype:"textfield",width:180},
	   html:'<iframe id = "ff" src="events.html?new="+Math.random() width="900px" height = "600px"></iframe> ',
	   closeAction: 'close',
	   listeners: {show: function(){
	   		var xmlinput = document.getElementById('importExport');
			  var xml = xmlinput.value;
	   		ff.contentWindow.fxml = xml;
	   }},
	   buttons:[{text:"确定",handler: function(){
	   		var x = window.ff.contentWindow.toXml();
	   		var c = ff.contentWindow.genCode();
	   		document.getElementById('importExport').value = x;
	   		document.getElementById('codeGen').value = c;
	   		w.destroy();
	   	}},{text:"取消",handler: function(){
	   		w.destroy();
	   	}}]
	})
	this.S = w;
	w.show();
}
