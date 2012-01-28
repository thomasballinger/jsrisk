
var dataEquivalent = function(a, b){
    var prop;
    for (prop in a){
        //console.log('checking '+prop)
        if (!a.hasOwnProperty(prop)){continue;}
        //console.log('  own prop')
        if (b[prop] == undefined){return false;}
        //console.log('  b also has')
        if (typeof a[prop] === 'object'){
            //console.log('  is object...')
            if (!dataEquivalent(a[prop], b[prop])){
                return false;
            }
        } else if (typeof a[prop] === 'function'){
            //console.log('  is function...')
            if (a[prop].toString() != b[prop].toString()){
                return false;
            }
        } else {
            if (a[prop] != b[prop]){return false;}
        }
    }
    return true;
};

var testDataEquivalent = function(){
    var x = {a:1, b:[2,3,4], c:{d:5, e:{f:6}}};
    var y = {a:1, b:[2,3,4], c:{d:5, e:{f:6}}};
    var bads = [
        {a:2, b:[2,3,4], c:{d:5, e:{f:6}}},
        {b:[2,3,4], c:{d:5, e:{f:6}}},
        {a:1, b:[3,4], c:{d:5, e:{f:6}}},
        {a:1, b:[2,3,4], c:{e:{f:6}}},
        {a:1, b:[2,3,4], c:{d:'dsf', e:{f:6}}},
        {},
    ];
    console.log(dataEquivalent(x, y));
    for (var i = 0; i < bads.length; i++){
        console.log(dataEquivalent(x, bads[i]));
    }
};

//testDataEquivalent();

var exports;
if (exports) {exports.dataEquivalent = dataEquivalent;}
