import { Node, mergeAttributes } from '@tiptap/core';

export const CustomImage = Node.create({
  name: 'image',

  group: 'inline',
  inline: true,
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: '300px' },
      float: { default: 'none' },
    };
  },

  parseHTML() {
    return [{
      tag: 'img[src]',
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement)) return {};
        return {
          src: node.getAttribute('src'),
          alt: node.getAttribute('alt'),
          title: node.getAttribute('title'),
          width: node.style.width,
          float: node.style.float,
        };
      }
    }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, {
      style: `width: ${HTMLAttributes.width}; float: ${HTMLAttributes.float};`,
    })];
  },

  addCommands() {
    return {
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  }
});
