var isIE = /*@cc_on!@*/!1;
var initTimes = 0;
function rotationPicture(img) {
    if (!img) return;
    _t = rotationPicture.prototype;
    _t._img = typeof img == 'string' ? document.getElementById(img) : img;
    initTimes = (++initTimes);
    //alert(initTimes);
    _t.r = 1;
    _t.addBtn();
    _t.bind();
}
rotationPicture.prototype.addBtn = function () {
    var btn = document.getElementById('rRight');
    var _this = rotationPicture.prototype;
    if (!btn) {
        _this._rRight = document.createElement('BUTTON');
        _this._rRight.setAttribute('id', 'rRight');
        _this._rRight.className = 'rotation';
        _this._rLeft = document.createElement('BUTTON');
        _this._rLeft.setAttribute('id', 'rLeft');
        _this._rLeft.className = 'rotation';
    }
    if (!isIE) {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        canvas.setAttribute('width', _this._img.width);
        canvas.setAttribute('height', _this._img.height);
        ctx.drawImage(_this._img, 0, 0);
        _this._ghost = this._img;
        _this._img.parentNode.replaceChild(canvas, this._img);
        _this._img = canvas;
    }
    //if (!btn) {    //delete btn;
    _this._img.parentNode.insertBefore(_this._rRight, _this._img);
    //}
    //_this._rLeft.insertAdjacentHTML(_this._rRight, _this._rLeft);
};
rotationPicture.prototype.bind = function () {
    var _this = rotationPicture.prototype;
    if (initTimes == 1) {//在第一次初始化时，才附加事件，否则事件会重复叠加。
        if (window.attachEvent) {
            _this._rRight.attachEvent('onclick', rotation);
        } else {
            _this._rRight.addEventListener('click', rotation, false);
        }
    }

    function rotation(clockwise) {
        if (_this.r > 3) _this.r = 0;
        if (isIE) {
            //IE浏览器，使用BasicImage滤镜。其它标准浏览器(FireFox,Chrome,Safari,Opera)都支持Canvas，
            //利用Canvas的rotate以及drawImage对图片进行旋转
            _this._img.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(Rotation=' + _this.r + ')';
        } else {
            var ctx = _this._img.getContext('2d');
            switch (_this.r) {
                case 0: //默认值，内容不旋转
                    _this._img.setAttribute('width', _this._ghost.width);
                    _this._img.setAttribute('height', _this._ghost.height);
                    ctx.drawImage(_this._ghost, 0, 0);
                    break;
                case 1: //内容旋转90度
                    _this._img.setAttribute('width', _this._ghost.height);
                    _this._img.setAttribute('height', _this._ghost.width);
                    ctx.rotate(90 * Math.PI / 180);
                    ctx.drawImage(_this._ghost, 0, -_this._ghost.height);
                    break;
                case 2: //内容旋转180度
                    _this._img.setAttribute('width', _this._ghost.width);
                    _this._img.setAttribute('height', _this._ghost.height);
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(_this._ghost, -_this._ghost.width, -_this._ghost.height);
                    break;
                case 3: //内容旋转270度
                    _this._img.setAttribute('width', _this._ghost.height);
                    _this._img.setAttribute('height', _this._ghost.width);
                    ctx.rotate(270 * Math.PI / 180);
                    ctx.drawImage(_this._ghost, -_this._ghost.width, 0);
                    break;
            }
        }
        _this.r++;
    }
};

Ext.namespace('Ext.Util.ImageViewer');
Ext.Util.ImageViewer = Ext.extend(Ext.Window, {
    title: '图片浏览',
    width: 500,
    height: 500,
    closeAction: 'close',
    resizable: false,
    modal: true,
    border: true,
    layout: 'fit',
    listIconCls: 'selectPerson',
    folderIconCls: 'foldericon',
    autoShow: true,
    listeners: { 'beforeshow': function () {
        rotationPicture('demo');
    }
    },
    constructor: function (config) {
        Ext.apply(this, config);
        this.App = new Ext.App({});
        Ext.Util.ImageViewer.superclass.constructor.call(this);
    },
    initComponent: function () {
        Ext.Util.ImageViewer.superclass.initComponent.apply(this, arguments);
        var o = document.getElementById('demo');
        if (o) {
            //delete o;
            o.parentNode.removeChild(o);
        }
        var panel = new Ext.Panel({
            id: 'dd',
            width: this.width - 20,
            height: this.height - 40,
            html: '<img src="' + this.url + '" id="demo" alt="Demo" width="' + (this.width - 20).toString() + '" height = "' + (this.height - 100).toString() + '" />'
            //,tabr: [{ text: '顺时针', handler: function () { alert(1)} }]
        });
        //this.html = '<img src="' + this.url + '" id="demo" alt="Demo" width="400" height = "360" />';
        this.add(panel);
    },
    buttonAlign: 'center',
    buttons: [{
        text: '关闭',
        handler: function () {
            var win = this.ownerCt.ownerCt;
            win.hide();
        }
    }]
})

Ext.reg('imageviewer', Ext.Util.ImageViewer);