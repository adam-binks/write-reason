import React from 'react'
import ReactDOM from 'react-dom'
import { css } from 'emotion'
import { Button, Icon, Menu } from './SlateComponents.js'

// adapted from https://github.com/ianstormtaylor/slate/blob/master/site/examples/hovering-toolbar.js

const MarkButton = ({ editor, type, icon }) => {
  const { value } = editor
  const isActive = value.blocks && value.blocks.some(block => block.type === type)
  return (
    <Button
      reversed
      active={isActive}
      onMouseDown={event => {
        event.preventDefault()
        editor.setBlocks((isActive ? "paragraph" : type))

        editor.getSharedState().logger.logEvent({
          'type': 'set_title' + (isActive ? "_disabled" : "_enabled"),
      });
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const HoverMenu = React.forwardRef(({ editor }, ref) => {
  const root = window.document.getElementById('root')
  return ReactDOM.createPortal(
    <Menu
      ref={ref}
      className={css`
        padding: 8px 7px 6px;
        position: absolute;
        z-index: 1;
        top: -10000px;
        left: -10000px;
        margin-top: -6px;
        opacity: 0;
        background-color: #222;
        border-radius: 4px;
        transition: opacity 0.25s;
      `}
    >
      <MarkButton editor={editor} type="heading" icon="Heading" />
    </Menu>,
    root
  )
})


class HoveringMenu extends React.Component {

  menuRef = React.createRef()

  componentDidMount = () => {
    this.updateMenu()
  }

  componentDidUpdate = () => {
    this.updateMenu()
  }

  updateMenu = () => {
    const menu = this.menuRef.current
    if (!menu) return

    const value = this.props.editor.value
    const { fragment, selection } = value

    if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
      menu.removeAttribute('style')
      return
    }

    const native = window.getSelection()
    const range = native.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    menu.style.opacity = 1
    menu.style.top = `${rect.top + window.pageYOffset - menu.offsetHeight}px`

    menu.style.left = `${rect.left +
      window.pageXOffset -
      menu.offsetWidth / 2 +
      rect.width / 2}px`
  }

  render = (props, editor, next) => {
    return (
        <HoverMenu ref={this.menuRef} editor={this.props.editor} />
    )
  }
}


export default function HoveringMenuPlugin(options) {
    return {
        renderEditor (props, editor, next) {
            const children = next()
            return (
              <React.Fragment>
                {children}
                <HoveringMenu editor={editor} />
              </React.Fragment>
            )
          },

        renderBlock (props, editor, next) {
            switch (props.node.type) {
            case 'heading':
                return <u><b>{props.children}</b></u>
            default:
                return next()
            }
        },
    }
}