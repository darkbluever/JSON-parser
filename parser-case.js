QUnit.test('add',function(){
    var result = add(1,2)
    QUnit.ok(result === 3, '正整数加法')
    // QUnit.ok(result === -3)
    // QUnit.equal(result,-3)
    QUnit.strictEqual(result, 3)
})