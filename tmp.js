// it should be different input examples
elementOpen('div', null, null);
elementVoid('input', null, null, 'type', 'password', 'name', 'pass');
elementVoid('input', null, null, 'type', 'text', 'name', 'text-1', 'placeholder', 'some name');
elementVoid('input', null, null, 'type', 'text', 'name', 'text-2', 'placeholder', 'some name', 'readonly', 'readonly');
elementVoid('input', null, null, 'type', 'text', 'name', 'text-3', 'placeholder', 'some name');
elementVoid('input', null, null, 'type', 'email');
elementClose('div');

// plain html
elementOpen('div', null, null, 'class', 'title');
text('Title');
elementClose('div');
elementOpen('ul', null, null);
elementOpen('li', null, null, 'class', 'row even');
text('John Smith');
elementOpen('em', null, null);
text('*');
elementClose('em');
elementClose('li');
elementOpen('li', null, null, 'class', 'row');
text('Mark Smith');
elementClose('li');
elementClose('ul');
elementOpen('p', null, null, 'style', 'font-size: 12px ;');
elementOpen('em', null, null);
text('* Olympic gold medalist');
elementClose('em');
elementClose('p');

//  templates     as attribute value 
elementVoid('span', null, null, 'class', isTrue ? 'first' : 'second', 'title', name + '<br>' + lastName);

//  templates as text 
elementOpen('div', null, null);
text(data.listTitle);
elementClose('div');
elementOpen('div', null, null);
text('test' + data.listTitle);
elementClose('div');
elementOpen('div', null, null);
text(data.listTitle + 'test');
elementClose('div');
elementOpen('div', null, null);
text('test' + data.listTitle + 'test');
elementClose('div');
elementOpen('div', null, null);
text('test' + data.listTitle + 'test' + data.listTitle);
elementClose('div');

// start embedded js 
elementOpen('ul', null, null);
var showFootnote = false;
data.listItems.forEach(function (listItem, i) {
    elementOpen('li', null, null, 'class', 'row ' + (i % 2 == 1 ? ' even' : ''));
    text(listItem.name);
    if (listItem.hasOlympicGold) {
        showFootnote = true;
        elementOpen('em', null, null);
        text('*');
        elementClose('em');
    }
    elementClose('li');
});
elementClose('ul');
if (showFootnote) {
    elementOpen('p', null, null, 'style', 'font-size: 12px;');
    elementOpen('em', null, null);
    text('* Olympic gold medalist');
    elementClose('em');
    elementClose('p');
}

//  issue
elementOpen('ul', null, null);
data.listItems.forEach(function (listItem, i) {
    if (listItem.hasOlympicGold) {
        elementOpen('li', null, null, 'class', 'row');
    } else {
        elementOpen('li', null, null, 'class', 'row even');
    }
    text(listItem.name);
    elementOpen('em', null, null);
    text('*');
    elementClose('em');
    elementClose('li');
});
elementClose('ul');

// keys cases
elementVoid('div', 'aKcDIpTeAtbU', null);
elementOpen('div', 'my-custom-key', null);

// arrays cases
elementVoid('div', null, mCrccKwZakRn);
elementVoid('div', null, myCustomArray);

// keys & arrays
elementOpen('div', 'XbVfDZiQeBHc', HdxIOaPVJcNN, 'class', 'row ' + (i % 2 == 1 ? ' even' : ''));
text('Content');
elementClose('div');
elementVoid('div', 'my-second-custom-key', myCustomArray);

{
    mCrccKwZakRn: ['class', 'box', 'style', 'align-content: center;'],
    myCustomArray: ['class', 'shadow', 'style', 'border: dashed;'],
    HdxIOaPVJcNN: ['style', 'align-content: center;']
}