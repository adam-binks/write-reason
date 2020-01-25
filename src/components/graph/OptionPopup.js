export default class OptionPopup {
    constructor(entries, x, y, callback) {
        var div = document.createElement("div");
        div.classList.add("option-popup-div");
        div.appendChild(this.generateTable(entries, div, callback));
        div.style.left = x + "px";
        div.style.top = y + "px";

        document.getElementById("graph").appendChild(div);
    }

    generateTable(entries, div, callback) {
        var table = document.createElement("table");
        entries.forEach(entry => {
            var row = table.insertRow();
            row.classList.add("option-row");
            row.addEventListener("click", e => {
                callback(entry);
                div.remove();
            });

            var colourCell = row.insertCell();
            colourCell.appendChild(document.createTextNode("→"));
            colourCell.style.color = entry.colour;
            colourCell.style.fontSize = "200%";

            var nameCell = row.insertCell();
            nameCell.appendChild(document.createTextNode(entry.name))
        });

        return table;
    }
}