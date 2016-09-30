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
    var str = '{"a":1,"b":false}';
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
    //var str = '{"a":1,"b":false}';
    //var ins1 = JsonUtil.tokenReader.createNew(str);
//});

QUnit.test('parse', function() {
    var str = '{"a":1,"b":false}';
    var ret = JsonUtil.parse(str);
    console.log(ret);
    QUnit.strictEqual(ret['a'], 1);
    QUnit.strictEqual(ret['b'], false);

    var str = 'false';
    var ret = JsonUtil.parse(str);
    console.log(ret);
    QUnit.strictEqual(ret, false);

    var str = 'true';
    var ret = JsonUtil.parse(str);
    console.log(ret);
    QUnit.strictEqual(ret, true);

    var str = 'null';
    var ret = JsonUtil.parse(str);
    console.log(ret);
    QUnit.strictEqual(ret, null);

    var str = '[{"a":1,"b":-1.2e+3}, 1, "abc", null, false, true, [1,2,3], [[4,5,6],[7,8,9],010]]';
    var ret = JsonUtil.parse(str);
    console.log(ret);
    QUnit.strictEqual(ret[0]['a'], 1);
    QUnit.strictEqual(ret[2], "abc");
    QUnit.strictEqual(ret[6][0], 1);
    QUnit.strictEqual(ret[7][0][1], 5);
    QUnit.strictEqual(ret[7][2], 10);

});
