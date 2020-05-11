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

        // prevent the popup from showing up partially offscreen
        const rect = div.getBoundingClientRect()
        if (rect.right > window.innerWidth) {
            div.style.left = (x - (rect.right - window.innerWidth)) + "px"
        }
        if (rect.bottom > window.innerHeight) {
            div.style.top = (y - (rect.bottom - window.innerHeight)) + "px"
        }

        if (shouldHideOnClickOutside) {
            setTimeout(() => this.hideOnClickOutside(div), 0.01);
        }
    }

    generateTable(entries, div, callback, selected) {
        var table = document.createElement("table");
        entries.forEach(entry => {
            entry.isClickable = entry.isClickable !== undefined ? entry.isClickable : true

            var row = table.insertRow();
            row.classList.add("option-row");
            if (entry.name === selected) {
                row.classList.add("option-row-selected");
            }

            const selectItem = (e) => {
                if (entry.isClickable) {                    
                    callback(entry);
                    div.remove();
                }
            }

            var colourCell = row.insertCell();
            colourCell.textContent = entry.symbol;
            colourCell.style.color = entry.colour;
            colourCell.style.fontSize = "150%";
            colourCell.style.padding = '10px'
            
            var nameCell = row.insertCell();
            nameCell.classList.add('option-cell')
            nameCell.textContent = entry.name

            colourCell.addEventListener('click', selectItem)
            nameCell.addEventListener('click', selectItem)

            if (entry.buttons) {
                entry.buttons.forEach(buttonEntry => {
                    var buttonCell = row.insertCell()
                    var button = document.createElement('BUTTON')
                    button.innerHTML = '<p class="' + buttonEntry.className + '"></p>'
                    button.className = "pure-button"
                    button.style.padding = "0px 10px 0px 10px"
                    buttonCell.appendChild(button)
                    button.onclick = (e) => buttonEntry.click(e, {colourCell, nameCell, buttonCell, underlyingEntry: buttonEntry.underlyingEntry, 
                            transientEntry: entry, underlyingEntries: buttonEntry.underlyingEntries, row})
                })
            }
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
        document.addEventListener('contextmenu', outsideClickListener)
    }
}