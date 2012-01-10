
var country = {
 'name' : 'default',
 'player_owned' : undefined,
 'num_troops' : undefined,
};

function Person(first, last, age){
    this.first = first;
    this.last = last;
    this.age = age;
    this.isOlderThan = function isOlderThan(person){
        return this.age > person.age;
    };
    this.toString = function(){
        return 'Person '+this.first+' '+this.last;
    };
}
var tom = new Person('Tom', 'Ballinger', 24);
var tin = new Person('Kristen', "Ballinger", 22);
document.writeln(tom);
document.writeln(tin);
document.writeln(tom.isOlderThan(tin));
document.writeln(tom.prototype)
alert('asdf');


