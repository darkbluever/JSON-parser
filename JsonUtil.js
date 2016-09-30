/*
  JsonUtil.js

  this file create function about json serialization and deserialization

  this repo is a personal practice

  reference:
  http://www.json.org/
  http://www.liaoxuefeng.com/article/0014211269349633dda29ee3f29413c91fa65c372585f23000
  https://github.com/douglascrockford/JSON-js

*/
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

    var simpleStack = {
        createNew : function() {
            var stack = {};
            stack.arr = [];
            stack.peek = function () {
                return stack.arr[stack.arr.length - 1];
            };

            stack.peekN = function (num) {
                if (num > stack.arr.length) {
                    return null;
                }
                return stack.arr[stack.arr.length - num];
            };

            stack.push = function (obj) {
                stack.arr.push(obj);
                return stack.arr.length;
            };

            stack.pop = function () {
                return stack.arr.pop();
            };

            stack.len = function () {
                return stack.arr.length;
            };

            return stack;
        }
    };

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

            reader.readedIndex() = function() {return pos;}

            reader.readed = function() {return originStr.substring(0, pos)}

            return reader;
        }
    };

    var tokenReader = {
        createNew : function(str) {
            var reader = {};
            var charReader = charReader.createNew(str);
            reader.charReader = charReader;

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
                throw new SyntaxError("parse error, unexpected token : '" + ch + "', index :" + charReader.readedIndex() + ", readed: " + charReader.readed());
            };

            reader.readNull = function() {
                var expected = "null";
                for (var i = 0; i < expected.length; i++){
                    var ch = charReader.next();
                    if (ch != expected[i]) {
                        throw new SyntaxError("parse error, unexpected char : '" + ch + "', index :" + charReader.readedIndex() + ", readed: " + charReader.readed());
                    }
                }
                return null;
            };

            reader.readBoolean = function() {
                var expected = null;
                var flag = charReader.peek();
                if (flag == 't') {
                    expected = "true";
                } else {
                    expected = "false";
                }
                for (var i = 0; i < expected.length; i++){
                    var ch = charReader.next();
                    if (ch != expected[i]) {
                        throw new SyntaxError("parse error, unexpected char : '" + ch + "', index :" + charReader.readedIndex() + ", readed: " + charReader.readed());
                    }
                }
                return flag == 't';
            };

            reader.readString = function() {
                var ch = charReader.next();
                if (ch != '"') {
                    throw new SyntaxError("parse error, expected \" , " + ch + " received, index :" + charReader.readedIndex() + ", readed: " + charReader.readed());
                }
                var ret = '';
                while(true) {
                    ch = charReader.next();
                    if (ch == '\\') {
                        // escape
                        ech = charReader.next();
                        switch (ech) {
                            case '"':
                                ret = ret + '\"';
                                break;
                            case '\\':
                                ret = ret + '\\';
                                break;
                            case '/':
                                ret = ret + '\/';
                                break;
                            case 'b':
                                ret = ret + '\b';
                                break;
                            case 'f':
                                ret = ret + '\f';
                                break;
                            case 'n':
                                ret = ret + '\n';
                                break;
                            case 'r':
                                ret = ret + '\r';
                                break;
                            case 't':
                                ret = ret + '\t';
                                break;
                            case 'u':
                                // unicode char
                                var u = '';
                                for (var i = 0; i < 4; i++) {
                                    var uch = charReader.next();
                                    if (uch < '0' || uch > 'F') {
                                        throw new SyntaxError("parse error, unexpected char '" + uch + "', index :" + charReader.readedIndex() + ", readed: " + charReader.readed());
                                    }
                                    u = u + '' + uch;
                                }

                                ret = ret + String.fromCharCode(parseInt(u));
                                break;
                            default:
                                throw new SyntaxError("parse error, unexpected char : '" + ech + "', index :" + charReader.readedIndex() + ", readed: " + charReader.readed());
                        }
                    } else if (ch == '"') {
                        // end of string
                        break;
                    } else {
                        ret = ret + '' + ch;
                    }
                }
                
                return ret;
            };

            reader.readNumber = function() {
                var value;
                var string = "";

                var ch = charReader.next();
                if (ch === '-') {
                    string += '-';
                    ch = charReader.next();
                }

                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    ch = charReader.next();
                }

                if (ch === '.') {
                    string += '.';
                    ch = charReader.next();
                    while (ch >= '0' && ch <= '9') {
                        string += ch;
                        ch = charReader.next();
                    }
                }

                if (ch === 'e' || ch === 'E') {
                    string += ch;
                    ch = charReader.next();
                    if (ch === '-' || ch === '+') {
                        string += ch;
                        ch = charReader.next();
                    }
                    while (ch >= '0' && ch <= '9') {
                        string += ch;
                        ch = charReader.next();
                    }
                }

                value = new Number(string);
                if (!isFinite(value)) {
                    throw new SyntaxError("parse error, invalid number format: '" + string + "', index :" + charReader.readedIndex() + ", readed: " + charReader.readed());
                }

                return value;
            };

            return reader;
        }
    };

    var FSM = {
        createNew : function() {
            var fsm = {};
            fsm.status_expect_begin_object = 0x0001;
            fsm.status_expect_object_key = 0x0002;
            fsm.status_expect_object_value = 0x0004;
            fsm.status_expect_end_object = 0x0008;

            fsm.STATUS_EXPECT_BEGIN_ARRAY = 0x0010;
            fsm.STATUS_EXPECT_ARRAY_VALUE = 0x0020;
            fsm.STATUS_EXPECT_END_ARRAY = 0x0040;

            fsm.STATUS_EXPECT_SINGLE_VALUE = 0x0080;
            fsm.STATUS_EXPECT_SEP_COLON = 0x0100;
            fsm.STATUS_EXPECT_SEP_COMMA = 0x0200;

            fsm.STATUS_EXPECT_END_DOCUMENT = 0x0400;

            fsm.curStatus;

            fsm.hasStatus = function (targetStatus) {
                return fsm.curStatus & targetStatus;
            };

            fsm.setStatus = function (targetStatus) {
                fsm.curStatus = targetStatus;
            };

            fsm.initStatus = function() {
                fsm.curStatus = fsm.STATUS_EXPECT_BEGIN_OBJECT | fsm.STATUS_EXPECT_BEGIN_ARRAY | fsm.STATUS_EXPECT_SINGLE_VALUE;
            };

            return fsm;
        }
    };


    var parse = function(str) {
        var tokenReader = tokenReader.createNew(str);
        var fsm = FSM.createNew();
        var stack = simpleStack.createNew();
        var arrayStack = simpleStack.createNew();
        var objStack = simpleStack.createNew();
        var scopeStack = simpleStack.createNew();

        for(;;) {
            fsm.initStatus();
            var token = tokenReader.next();
            switch (token) {
                case TOKEN_BEGIN_OBJECT:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_BEGIN_OBJECT)) {
                        var tmpObj = {};
                        objStack.push(tmpObj);
                        fsm.setStatus(fsm.STATUS_EXPECT_OBJECT_KEY | fsm.STATUS_EXPECT_BEGIN_OBJECT | fsm.STATUS_EXPECT_END_OBJECT);
                        scopeStack.push(TOKEN_BEGIN_OBJECT);
                        continue;
                    }
                    throw new SyntaxError("Unexpected char '{', index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                case TOKEN_BEGIN_ARRAY:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_BEGIN_ARRAY)) {
                        var tmpArray = [];
                        arrayStack.push(tmpArray);
                        fsm.setStatus(fsm.STATUS_EXPECT_ARRAY_VALUE | fsm.STATUS_EXPECT_BEGIN_ARRAY | fsm.STATUS_EXPECT_END_ARRAY | fsm.STATUS_EXPECT_BEGIN_OBJECT);
                        scopeStack.push(TOKEN_BEGIN_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected char '[', index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                case TOKEN_NULL:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SINGLE_VALUE)) {
                        var val = tokenReader.readNull();
                        stack.push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_OBJECT_VALUE)) {
                        var val = tokenReader.readNull();
                        var key = stack.pop();
                        objStack.peek().key = val;
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_ARRAY_VALUE)) {
                        var val = tokenReader.readNull();
                        arrayStack.peek().push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected null, index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                case TOKEN_BOOLEAN:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SINGLE_VALUE)) {
                        var val = tokenReader.readBoolean();
                        stack.push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_OBJECT_VALUE)) {
                        var val = tokenReader.readBoolean();
                        var key = stack.pop();
                        objStack.peek().key = val;
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_ARRAY_VALUE)) {
                        var val = tokenReader.readBoolean();
                        arrayStack.peek().push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected boolean, index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                case TOKEN_NUMBER:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SINGLE_VALUE)) {
                        var val = tokenReader.readNumber();
                        stack.push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_OBJECT_VALUE)) {
                        var val = tokenReader.readNumber();
                        var key = stack.pop();
                        objStack.peek().key = val;
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_ARRAY_VALUE)) {
                        var val = tokenReader.readNumber();
                        arrayStack.peek().push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected number, index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
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
                        var key = stack.pop();
                        objStack.peek().key = val;
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        continue;
                    }
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_ARRAY_VALUE)) {
                        var val = tokenReader.readString();
                        arrayStack.peek().push(val);
                        fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected char '\"', index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                case TOKEN_SEP_COLON:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_SEP_COLON)) {
                        fsm.setStatus(fsm.STATUS_EXPECT_OBJECT_VALUE | fsm.STATUS_EXPECT_BEGIN_OBJECT | fsm.STATUS_EXPECT_BEGIN_ARRAY);
                        continue;
                    }
                    throw new SyntaxError("Unexpected char ':', index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
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
                    throw new SyntaxError("Unexpected char ',', index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                case TOKEN_END_OBJECT:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_END_OBJECT)) {
                        if (scopeStack.length == 0) {
                            var tmpObj = objStack.pop();
                            stack.push(tmpObj);
                            fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                            continue;
                        }

                        if (scopeStack.peek() == TOKEN_BEGIN_OBJECT) {
                            scopeStack.pop();
                        } else {
                            throw new SyntaxError("Unexpected char '}', scope not match, index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                        }

                        var lastScope = scopeStack.peek();
                        if (lastScope == TOKEN_BEGIN_ARRAY) {
                            var tmpObj = objStack.pop();
                            arrayStack.peek().push(tmpObj);
                            fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        }
                        if (lastScope == TOKEN_BEGIN_OBJECT) {
                            var tmpObj = objStack.pop();
                            var key = statck.pop();
                            objStack.peek().key = tmpObj;
                            fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        }
                        throw new SyntaxError("Unexpected char '}', index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                    }
                    throw new SyntaxError("Unexpected char '}', index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                case TOKEN_END_ARRAY:
                    if (fsm.hashStatus(fsm.STATUS_EXPECT_END_ARRAY)) {
                        if (scopeStack.length == 0) {
                            var tmpArr = arrayStack.pop();
                            stack.push(tmpArr);
                            fsm.setStatus(fsm.STATUS_EXPECT_END_DOCUMENT);
                            continue;
                        }

                        if (scopeStack.peek() == TOKEN_BEGIN_ARRAY) {
                            scopeStack.pop();
                        } else {
                            throw new SyntaxError("Unexpected char ']', scope not match, index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                        }

                        var lastScope = scopeStack.peek();
                        if (lastScope == TOKEN_BEGIN_ARRAY) {
                            var tmpArr = arrayStack.pop();
                            arrayStack.peek().push(tmpArr);
                            fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_ARRAY);
                        }
                        if (lastScope == TOKEN_BEGIN_OBJECT) {
                            var tmpArr = arrayStack.pop();
                            var key = statck.pop();
                            objStack.peek().key = tmpArr;
                            fsm.setStatus(fsm.STATUS_EXPECT_COMMA | fsm.STATUS_EXPECT_END_OBJECT);
                        }
                        throw new SyntaxError("Unexpected char ']', index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                    }
                    throw new SyntaxError("Unexpected char ']', index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
                case TOKEN_END_DOCUMENT:
                    if (fsm.hasStatus(fsm.STATUS_EXPECT_END_DOCUMENT)) {
                        var val = stack.pop();
                        if (stack.length == 0) {
                            return val;
                        }
                    }
                    throw new SyntaxError("Unexpected EOF, index :" + tokenReader.charReader.readedIndex() + ", readed: " + tokenReader.charReader.readed());
            }
        }
    };


    var toJson = function(obj) {

    };


    return {
        parse        : parse,
        toJson       : toJson,
// functions below are added for test
        charReader   : charReader,
        tokenReader  : tokenReader,
        simpleStack  : simpleStack
    };
})();
