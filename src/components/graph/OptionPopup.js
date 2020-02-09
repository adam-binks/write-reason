export default class OptionPopup {
    constructor(entries, x, y, shouldHideOnClickOutside, callback, selected=undefined, parent=undefined) {
        var div = document.createElement("div");
        div.classList.add("option-popup-div");
        div.appendChild(this.generateTable(entries, div, callback, selected));
        div.style.left = x + "px";
        div.style.top = y + "px";

        if (parent === undefined) {
            parent = document.getElementById("graph");
        }
        parent.appendChild(div);

        if (shouldHideOnClickOutside) {
            setTimeout(() => this.hideOnClickOutside(div), 0.01);
        }
    }

    generateTable(entries, div, callback, selected) {
        var table = document.createElement("table");
        entries.forEach(entry => {
            var row = table.insertRow();
            row.classList.add("option-row");
            if (entry.name === selected) {
                row.classList.add("option-row-selected");
            }

            row.addEventListener("click", e => {
                callback(entry);
                div.remove();
            });

            var colourCell = row.insertCell();
            colourCell.appendChild(document.createTextNode(entry.symbol));
            colourCell.style.color = entry.colour;
            colourCell.style.fontSize = "200%";

            var nameCell = row.insertCell();
            nameCell.appendChild(document.createTextNode(entry.name))
        });

        return table;
    }

    hideOnClickOutside(element) {
        const isVisible = elem => !!elem && !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );

        const outsideClickListener = event => {
            if (!element.contains(event.target) && isVisible(element)) {
              element.remove();
              removeClickListener()
            }
        }
    
        const removeClickListener = () => {
            document.removeEventListener('click', outsideClickListener)
        }
    
        document.addEventListener('click', outsideClickListener)
    }
}