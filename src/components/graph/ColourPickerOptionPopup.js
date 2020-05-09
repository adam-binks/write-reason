import OptionPopup from "./OptionPopup"

const COLOURS = [
    'red',
    'maroon',
    'yellow',
    'olive',
    'lime',
    'green',
    'aqua',
    'teal',
    'blue',
    'fuchsia',
    'purple',
]

export default function makeColourPicker(x, y, shouldHideOnClickOutside, callback, selected=undefined, parent=undefined) {
    const entries = COLOURS.map(colour_string => {
        return {
            name: colour_string,
            colour: colour_string,
            symbol: '■',
        }
    })

    return new OptionPopup(entries, x, y, shouldHideOnClickOutside, callback, selected=undefined, parent=undefined)
}