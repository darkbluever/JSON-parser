var JsonUtil = (function(){

    var TOKEN_BEGIN_OBJECT = '{';
    var TOKEN_END_OBJECT = '}';
    var TOKEN_BEGIN_ARRAY = '[';
    var TOKEN_END_ARRAY = ']';
    var TOKEN_SEP_COLON = ':';
    var TOKEN_SEP_COMMA = ',';
    var TOKEN_STRING = '"';
    var TOKEN_BOOLEAN = 'TF';
    var TOKEN_NULL = 'null';
    var TOKEN_NUMBER = '[-]0-9';

    var charReader = {
        createNew : function (str) {
            var reader = {};
            var originStr = str;
            var pos = 0;
            var len = str.length;

            reader.next = function() {
                var ch = '';
                if (pos < len) {
                    ch = originStr[pos];
                    pos++;
                }
                return ch;
            };

            reader.nextN = function(num) {
                var str = '';
                for (var i = 0; i < num && pos < len; i++) {
                    str += this.next();
                }

                return str;
            };

            reader.peek = function() {
                var ch = '';
                if (pos < len) {
                    ch = originStr[pos];
                }
                return ch;
            };

            reader.hasMore = function() {return pos < len;}

            return reader;
        }
    };

    var tokenReader = {
        createNew : function(str) {
            var reader = {};
            var charReader = charReader.createNew(str);

            reader.isWhiteSpace = function(ch) {
                return ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r';
            };

            reader.next = function() {
                var ch = '?';

                //skip white space
                for (;;) {
                    if (!charReader.hasMore()) {
                        return 0;
                    }
                    ch = charReader.peek();
                    if (!this.isWhiteSpace(ch)) {
                        break;
                    }
                    charReader.next();
                }

                switch(ch) {
                    case '{':
                        return TOKEN_BEGIN_OBJECT;
                    case '}':
                        return TOKEN_END_OBJECT;
                    case '[':
                        return TOKEN_BEGIN_ARRAY;
                    case ']':
                        return TOKEN_END_ARRAY;
                    case ':':
                        return TOKEN_SEP_COLON;
                    case ',':
                        return TOKEN_SEP_COMMA;
                    case '\"':
                        return TOKEN_STRING;
                    case 'n':
                        return TOKEN_NULL;
                    case 't':
                    case 'f':
                        return TOKEN_BOOLEAN;
                }
                if ((ch >= '0' && ch <= '9') || ch == '-') {
                    return TOKEN_NUMBER;
                }

                return -1;
            };
        }
    };


    var read = function(str) {
        switch (str[0]) {
            case '{':
                return TOKEN_BEGIN_OBJECT;
            case '}':
                return TOKEN_END_OBJECT;


        }
    }

    var parse = function(str) {
        var stack = [];
        for (;;) {
            var ch = stack[0];
        }
        for (var i = 0; i < str.length; i++) {
            stack.push(str[i]);
        }

        var ret = "";
        while(stack.length > 0) {
            ret = ret + stack.pop();
        }
        return ret;
    };

    var parseNum = function(str) {
        var numReg = /^0$|^-?[1-9]+[0-9]+$/;
        ret = numReg.test(str);
        if (ret) {
            ret = parseInt(str);
        }
        return ret;
    };

    var parseStr = function(str) {
        var strReg = /^"[^"]*"$/;
        ret = strReg.test(str);
        if (ret) {
            len = str.length;
            ret = str.substr(1, len-2);
        }
        return ret;
    };

    var parseLiteral = function(str) {
        //The literal names MUST be lowercase.  No other literal names are allowed.
        switch(str){
            case "true":
                return true;
            case "false":
                return false;
            case "null":
                return null;
            default:
                return 1;
        }
    };

    var toJson = function(obj) {

    };


    return {
        parse        : parse,
        toJson       : toJson,
        parseNum     : parseNum,
        parseStr     : parseStr,
        parseLiteral : parseLiteral,
        charReader   : charReader
    };
})();
