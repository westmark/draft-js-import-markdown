import Parser from 'remark/lib/parse';
import File from 'vfile';
import escape from 'remark/lib/escape.json';
import {
  TextNode,
  ElementNode,
  FragmentNode,
  SELF_CLOSING,
} from 'synthetic-dom';

const processor = {
  data: {escape},
};
const defaults = {
  commonmark: true,
};

function getTagName(node) {
  switch (node.type) {
    case 'root': {
      return 'div';
    }
    case 'paragraph': {
      return 'p';
    }
    case 'list': {
      return node.ordered ? 'ol' : 'ul';
    }
    case 'listItem': {
      return 'li';
    }
    // inline
    case 'strong': {
      return 'strong';
    }
    case 'emphasis': {
      return 'em';
    }
    case 'link': {
      return 'a';
    }
    default: {
      return 'span';
    }
  }
}

function processNode(node) {
  if (node.type === 'text') {
    return new TextNode(node.value);
  }
  let childNodes = node.children ? node.children.map(processNode) : [];
  return new ElementNode(getTagName(node), [], childNodes);
}

export default function parseMarkdown(markdown, opts) {
  let file = new File({
    directory: '~',
    filename: 'example',
    extension: 'txt',
    contents: markdown,
  });
  opts = Object.assign({}, defaults, opts);
  let rootNode = new Parser(file, opts, processor).parse();
  console.log(rootNode.children[0]);
  return processNode(rootNode);
}
