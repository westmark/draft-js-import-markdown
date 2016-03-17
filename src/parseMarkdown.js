/* @flow */

import Parser from 'remark/lib/parse';
import File from 'vfile';
import escape from 'remark/lib/escape.json';
import {
  TextNode,
  ElementNode,
} from 'synthetic-dom';

const processor = {
  data: {escape},
};
const defaults = {
  commonmark: true,
};

type ASTNode = {
  type: string;
  value: ?string;
  children: ?Array<ASTNode>;
};
type StringMap = {[key: string]: any};
type KeyValueArray = Array<[string, ?string]>

function getLinkAttrs(node: ASTNode): KeyValueArray {
  let attrs = [];
  if (node.url != null) {
    attrs.push(['href', node.url]);
  }
  if (node.title != null) {
    attrs.push(['title', node.title]);
  }
  return attrs;
}

function getElement(node: ASTNode, childNodes: Array<Node>): ElementNode {
  switch (node.type) {
    case 'root': {
      return new ElementNode('div', null, childNodes);
    }
    case 'paragraph': {
      return new ElementNode('p', null, childNodes);
    }
    case 'list': {
      let tagName = node.ordered ? 'ol' : 'ul';
      return new ElementNode(tagName, null, childNodes);
    }
    case 'listItem': {
      return new ElementNode('li', null, childNodes);
    }
    case 'thematicBreak': {
      return new ElementNode('hr');
    }
    // inline
    case 'strong': {
      return new ElementNode('strong', null, childNodes);
    }
    case 'emphasis': {
      return new ElementNode('em', null, childNodes);
    }
    case 'link': {
      return new ElementNode('a', getLinkAttrs(node), childNodes);
    }
    default: {
      return new ElementNode('span', null, childNodes);
    }
  }
}

function processNode(node: ASTNode): Node {
  if (node.type === 'text') {
    return new TextNode(node.value);
  }
  let childNodes = node.children ? node.children.map(processNode) : [];
  return getElement(node, childNodes);
}

export default function parseMarkdown(markdown: string, opts: ?StringMap): ElementNode {
  let file = new File({
    directory: '~',
    filename: 'example',
    extension: 'txt',
    contents: markdown,
  });
  opts = Object.assign({}, defaults, opts);
  let rootNode = new Parser(file, opts, processor).parse();
  return processNode(rootNode);
}
