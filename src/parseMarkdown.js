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
  depth: ?number;
  children: ?Array<ASTNode>;
};
type StringMap = {[key: string]: any};
type MapOfFunctions = {[key: string]: Function};
type KeyValueArray = Array<[string, ?string]>

const TAG_MAP = {
  root: 'div',
  blockquote: 'blockquote',
  code: 'pre',
  listItem: 'li',
  paragraph: 'p',
  thematicBreak: 'hr',
  // inline
  emphasis: 'em',
  image: 'img',
  inlineCode: 'code',
  link: 'a',
  strong: 'strong',
};

const ATTR_GETTERS = {
  code(node: ASTNode): KeyValueArray {
    return (node.lang == null) ? [] : [['lang', node.lang]];
  },
  link(node: ASTNode): KeyValueArray {
    let attrs = [];
    if (node.url != null) {
      attrs.push(['href', node.url]);
    }
    if (node.title != null) {
      attrs.push(['title', node.title]);
    }
    return attrs;
  },
  image(node: ASTNode): KeyValueArray {
    let attrs = [];
    if (node.url != null) {
      attrs.push(['src', node.url]);
    }
    if (node.title != null) {
      attrs.push(['title', node.title]);
    }
    if (node.alt != null) {
      attrs.push(['alt', node.alt]);
    }
    return attrs;
  },
};

const CHILD_GETTERS = {
  code(childNodes: Array<Node>): Array<Node> {
    return [new ElementNode('code', null, childNodes)];
  },
};

const TAG_GETTERS = {
  heading(node: ASTNode): string {
    // This is to make Flow happy.
    let depth = (node.depth == null) ? '' : node.depth.toString();
    return 'h' + depth;
  },
  list(node: ASTNode): string {
    return node.ordered ? 'ol' : 'ul';
  },
};

function callGetter(map: MapOfFunctions, name: string, ...args: Array<any>): ?any {
  if (name in map) {
    return map[name](...args);
  }
}

function createElement(node: ASTNode, childNodes: Array<Node>): Node {
  let {type} = node;
  let tagName = callGetter(TAG_GETTERS, type, node) || TAG_MAP[type] || 'span';
  let attrs = callGetter(ATTR_GETTERS, type, node);
  let newChildNodes = callGetter(CHILD_GETTERS, type, childNodes) || childNodes;
  return new ElementNode(tagName, attrs, newChildNodes);
}

function processNode(node: ASTNode): Node {
  if (node.type === 'text') {
    return new TextNode(node.value);
  }
  let childNodes;
  // This handles a
  if (typeof node.value === 'string') {
    childNodes = [new TextNode(node.value)];
  } else {
    childNodes = node.children ? node.children.map(processNode) : [];
  }
  return createElement(node, childNodes);
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
