var JsonUtil = (function(){

    var TOKEN_BEGIN_OBJECT = 1;
    var TOKEN_END_OBJECT = 2;
    var TOKEN_BEGIN_ARRAY = 3;
    var TOKEN_END_ARRAY = 4;
    var TOKEN_SEP_COLON = 5;
    var TOKEN_SEP_COMMA = 6;
    var TOKEN_STRING = 7;
    var TOKEN_BOOLEAN = 8;
    var TOKEN_NULL = 9;
    var TOKEN_NUMBER = 10;
    var TOKEN_END_DOCUMENT = 11;

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
                        return TOKEN_END_DOCUMENT;
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
                throw new SyntaxError("parse error, unexpected token : '" + ch + "'");
            };

            reader.readNull = function() {
                
            };

            reader.readBoolean = function() {
                
            };

            reader.readString = function() {
                
            };

            reader.readNumber = function() {
                
            };

            return reader;
        }
    };

    var fsm = {

        var STATUS_EXPECT_BEGIN_OBJECT = 0x0001;
        var STATUS_EXPECT_OBJECT_KEY = 0x0002;
        var STATUS_EXPECT_OBJECT_VALUE = 0x0004;
        var STATUS_EXPECT_END_OBJECT = 0x0008;

        var STATUS_EXPECT_BEGIN_ARRAY = 0x0010;
        var STATUS_EXPECT_ARRAY_VALUE = 0x0020;
        var STATUS_EXPECT_END_ARRAY = 0x0040;

        var STATUS_EXPECT_SINGLE_VALUE = 0x0080;
        var STATUS_EXPECT_SEP_COLON = 0x0100;
        var STATUS_EXPECT_SEP_COMMA = 0x0200;

        var STATUS_EXPECT_END_DOCUMENT = 0x0400;

        var curStatus;

        var hasStatus(targetStatus) {
            return curStatus & targetStatus;
        };

        var setStatus(targetStatus) {
            curStatus = targetStatus;
        };

        var initStatus() {
            curStatus = STATUS_EXPECT_BEGIN_OBJECT | STATUS_EXPECT_BEGIN_ARRAY | STATUS_EXPECT_SINGLE_VALUE;
        }
    };


    var parse = function(str) {
        var tokenReader = tokenReader.createNew(str);
        var stack = [];
        var arrayStack = [];
        var objStack = [];

        for(;;) {
            fsm.initStatus();
            var token = tokenReader.next();
            switch (token) {
                case TOKEN_BEGIN_OBJECT:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_BEGIN_OBJECT)) {
                        var tmpObj = {};
                        objStack.push(tmpObj);
                        fsm.setStatus(fsm.STATUS_EXPECT_OBJECT_KEY | fsm.STATUS_EXPECT_BEGIN_OBJECT | fsm.STATUS_EXPECT_END_OBJECT);
                        continue;
                    }
                    throw new SyntaxError("Unexpected char '" + TOKEN_BEGIN_OBJECT + "'");
                case TOKEN_BEGIN_ARRAY:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_BEGIN_ARRAY)) {
                        var tmpArray = [];
                        arrayStack.push(tmpArray);
                        fsm.setStatus(fsm.STATUS_EXPECT_ARRAY_VALUE | fsm.STATUS_EXPECT_BEGIN_ARRAY | fsm.STATUS_EXPECT_END_ARRAY | fsm.STATUS_EXPECT_BEGIN_OBJECT);
                        continue;
                    }
                    throw new SyntaxError("Unexpected char '" + TOKEN_BEGIN_ARRAY + "'");
                case TOKEN_NULL:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SINGLE_VALUE)) {
                        var val = tokenReader.readNull();
                        stack.push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_OBJECT_VALUE)) {
                        var val = tokenReader.readNull();
                        var tmpObj = objStack.pop();
                        var key = stack.pop();
                        tmpObj.key = val;
                        objStack.put(tmpObj);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_ARRAY_VALUE)) {
                        var val = tokenReader.readNull();
                        var tmpArray = arrayStack.pop();
                        tmpArray.push(val);
                        arrayStack.put(tmpArray);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected null");
                case TOKEN_BOOLEAN:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SINGLE_VALUE)) {
                        var val = tokenReader.readBoolean();
                        stack.push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_OBJECT_VALUE)) {
                        var val = tokenReader.readBoolean();
                        var tmpObj = objStack.pop();
                        var key = stack.pop();
                        tmpObj.key = val;
                        objStack.put(tmpObj);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_ARRAY_VALUE)) {
                        var val = tokenReader.readBoolean();
                        var tmpArray = arrayStack.pop();
                        tmpArray.push(val);
                        arrayStack.put(tmpArray);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected boolean");
                case TOKEN_NUMBER:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SINGLE_VALUE)) {
                        var val = tokenReader.readNumber();
                        stack.push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_OBJECT_VALUE)) {
                        var val = tokenReader.readNumber();
                        var tmpObj = objStack.pop();
                        var key = stack.pop();
                        tmpObj.key = val;
                        objStack.put(tmpObj);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_ARRAY_VALUE)) {
                        var val = tokenReader.readNumber();
                        var tmpArray = arrayStack.pop();
                        tmpArray.push(val);
                        arrayStack.put(tmpArray);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected number");
                case TOKEN_STRING:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SINGLE_VALUE)) {
                        var val = tokenReader.readString();
                        stack.push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_OBJECT_KEY)) {
                        var val = tokenReader.readString();
                        stack.push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_COLON);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_OBJECT_VALUE)) {
                        var val = tokenReader.readString();
                        var tmpObj = objStack.pop();
                        var key = stack.pop();
                        tmpObj.key = val;
                        objStack.put(tmpObj);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_ARRAY_VALUE)) {
                        var val = tokenReader.readString();
                        var tmpArray = arrayStack.pop();
                        tmpArray.push(val);
                        arrayStack.put(tmpArray);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected char '" + TOKEN_STRING + "'");
                case TOKEN_SEP_COLON:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SEP_COLON)) {
                        fsm.setStatus(fsm.STATUS_EXPECT_OBJECT_VALUE | fsm.STATUS_EXPECT_BEGIN_OBJECT | fsm.STATUS_EXPECT_BEGIN_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected char '" + TOKEN_SEP_COLON + "'");
                case TOKEN_SEP_COMMA:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SEP_COMMA)) {
                        if (fsm.hasStatus(fsm.STATUS_EXPECT_END_OBJECT)) {
                            fsm.setStatus(fsm.STATUS_EXPECT_OBJECT_KEY);
                            continue;
                        }
                        if (fsm.hasStatus(fsm.STATUS_EXPECT_END_ARRAY)) {
                            fsm.setStatus(fsm.STATUS_EXPECT_ARRAY_VALUE | fsm.STATUS_EXPECT_BEGIN_OBJECT | fsm.STATUS_EXPECT_BEGIN_ARRAY);
                            continue;
                        }
                    }
                    throw new SyntaxError("Unexpected char '" + TOKEN_SEP_COMMA + "'");
                case TOKEN_END_OBJECT:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_END_OBJECT)) {
                        var tmpObj = objStack.pop();
                        if (stack.length == 0) {
                            stack.push(tmpObj);
                            fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                            continue;
                        }
                        
                    }
                    throw new SyntaxError("Unexpected char '" + TOKEN_END_OBJECT + "'");
                case TOKEN_END_ARRAY:
                    if (fsm.hashStatus(fsm.STATUS_EXPECT_END_ARRAY)) {
                    
                    }
                    throw new SyntaxError("Unexpected char '" + TOKEN_END_ARRAY + "'");
                case TOKEN_END_DOCUMENT:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_END_DOCUMENT)) {
                        var val = stack.pop();
                        if (stack.length == 0) {
                            return val;
                        }
                    }
                    throw new SyntaxError("Unexpected EOF");
            }
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
        charReader   : charReader,
        tokenReader  : tokenReader
    };
})();
