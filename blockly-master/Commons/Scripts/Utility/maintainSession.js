//维持Session不过期
var maintainSession = {
    callBack: null,
    //scope:this,
    post: function () {
        Ext.Ajax.request({
            url: '/MaintainSessionHandler.ashx',
            method: 'GET',
            params: { method: 'maintainSession', random: new Date().getTime() }
        });
    },
    run: function () {
        this.stop();
        this.msHandle = setInterval(this.post, 1000 * 60 * 10);
    },
    stop: function () {
        if (this.msHandle)
            clearTimeout(this.msHandle);
    }
};
