elementOpen("div", null, null);
text("{% data.listTitle %}");
elementClose("div");
elementOpen("ul", null, null);
var showFootnote = false;     data.listItems.forEach(function(listItem, i) {
    elementOpen("li", null, null, "class", "row {%(i % 2 == 1 ? ' even' : '')%}");
    text("{% listItem.name %}");
    if (listItem.hasOlympicGold){         showFootnote = true;
        elementOpen("em", null, null);
        text("*");
        elementClose("em");
    }
    elementClose("li");
});
elementClose("ul");
if (showFootnote){
    elementOpen("p", null, null, "style", "font-size: 12px ;");
    elementOpen("em", null, null);
    text("* Olympic gold medalist");
    elementClose("em");
    elementClose("p");
}
