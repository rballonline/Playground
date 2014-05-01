define(["require", "exports"], function(require, exports) {
    var Hub = (function () {
        function Hub() {
            //var hub = $.connection.siteHub;
            $.connection.hub.start().done(function () {
            });
        }
        return Hub;
    })();
    exports.Hub = Hub;
});
//# sourceMappingURL=hub.js.map
