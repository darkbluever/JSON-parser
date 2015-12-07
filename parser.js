var demoJson = (function(){
    var add = function(a, b) {
        return a + b;
    };

    var add2 = function(a, b) {
        return add(a, b);
    }
    return {
        add2 : add2,
    };
})();