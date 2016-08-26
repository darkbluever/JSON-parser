module("JsonUtil");

QUnit.test('simpleStack', function() {
    var stack = JsonUtil.simpleStack.createNew();
    
    var testObj = {};
    var testArr = [];
    stack.push(testObj);
    stack.push(testArr);

    stack.peekN(2).a = 'b';
    stack.peek().push('b');

    var arr = stack.pop();
    var obj = stack.pop();
    QUnit.strictEqual(arr[0], 'b');
    QUnit.strictEqual(obj.a, 'b');
});

QUnit.test('charReader', function() {
    var str = '{"a":1,"b":FALSE}';
    var ins1 = JsonUtil.charReader.createNew(str);

    var shortStr = 'null';
    var ins2 = JsonUtil.charReader.createNew(shortStr);

    QUnit.strictEqual(ins1.next(), '{');
    QUnit.strictEqual(ins1.next(), '"');



    QUnit.strictEqual(ins2.nextN(4), 'null');
    QUnit.strictEqual(ins2.hasMore(), false);
    QUnit.strictEqual(ins2.next(), '');
    QUnit.strictEqual(ins2.next(), '');
    QUnit.strictEqual(ins2.peek(), '');
    QUnit.strictEqual(ins2.nextN(2), '');

    QUnit.strictEqual(ins1.peek(), 'a');
    QUnit.strictEqual(ins1.peek(), 'a');
    QUnit.strictEqual(ins1.nextN(3), 'a":');
    QUnit.strictEqual(ins1.hasMore(), true);
    QUnit.strictEqual(ins1.next(), '1');
});

//QUnit.test('tokenReader', function() {
//    var str = '{"a":1,"b":FALSE}';
//
//});

// QUnit.test('parseNum', function(){
//     QUnit.strictEqual(JsonUtil.parseNum('0'), 0);
//     QUnit.strictEqual(JsonUtil.parseNum('22'), 22);
//     QUnit.strictEqual(JsonUtil.parseNum('-21'), -21);
//     QUnit.strictEqual(JsonUtil.parseNum('-102'), -102);
//     QUnit.strictEqual(JsonUtil.parseNum('220'), 220);

//     QUnit.strictEqual(JsonUtil.parseNum('022'), false);
//     QUnit.strictEqual(JsonUtil.parseNum('-0'), false);
//     QUnit.strictEqual(JsonUtil.parseNum('01'), false);
//     QUnit.strictEqual(JsonUtil.parseNum('-01'), false);
// });


// QUnit.test('parseStr', function(){
//     QUnit.strictEqual(JsonUtil.parseStr('""'), "");
//     QUnit.strictEqual(JsonUtil.parseStr('"adf"'), "adf");
//     QUnit.strictEqual(JsonUtil.parseStr('"你好"'), "你好");
//     QUnit.strictEqual(JsonUtil.parseStr('"ad$^f"'), "ad$^f");
//     QUnit.strictEqual(JsonUtil.parseStr('"22"'), "22");
//     QUnit.strictEqual(JsonUtil.parseStr('"adb\"dd"'), "adb\"dd");

//     QUnit.strictEqual(JsonUtil.parseStr('"a'), false);
//     QUnit.strictEqual(JsonUtil.parseStr('abs'), false);
//     QUnit.strictEqual(JsonUtil.parseStr('"adb"dd"'), false);
//     QUnit.strictEqual(JsonUtil.parseStr('dsf"'), false);
//     QUnit.strictEqual(JsonUtil.parseStr('3"1dsf"'), false);
//     QUnit.strictEqual(JsonUtil.parseStr('"dsf"sas'), false);
// });


// QUnit.test('parseLiteral', function(){
//     QUnit.strictEqual(JsonUtil.parseLiteral('true'), true);
//     QUnit.strictEqual(JsonUtil.parseLiteral('false'), false);
//     QUnit.strictEqual(JsonUtil.parseLiteral('null'), null);
//     QUnit.strictEqual(JsonUtil.parseLiteral('TRUE'), true);
//     QUnit.strictEqual(JsonUtil.parseLiteral('FALSE'), false);
//     QUnit.strictEqual(JsonUtil.parseLiteral('NULL'), null);
//     QUnit.strictEqual(JsonUtil.parseLiteral('True'), true);

//     QUnit.strictEqual(JsonUtil.parseLiteral('truea'), 1);
//     QUnit.strictEqual(JsonUtil.parseLiteral('123'), 1);
//     QUnit.strictEqual(JsonUtil.parseLiteral(''), 1);
//     QUnit.strictEqual(JsonUtil.parseLiteral('f"'), 1);
// });
