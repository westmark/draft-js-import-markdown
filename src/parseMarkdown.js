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
type KeyValueArray = Array<[string, ?string]>
type ElementDescriptor = [string, ?KeyValueArray]

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

function getImageAttrs(node: ASTNode): KeyValueArray {
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
}

function getCodeBlockAttrs(node: ASTNode): KeyValueArray {
  return (node.lang == null) ? [] : [['lang', node.lang]];
}

function parseNode(node: ASTNode): ElementDescriptor {
  switch (node.type) {
    case 'root': {
      return ['div'];
    }
    case 'paragraph': {
      return ['p'];
    }
    case 'blockquote': {
      return ['blockquote'];
    }
    case 'heading': {
      // This is to make Flow happy.
      let depth = (node.depth == null) ? '' : node.depth.toString();
      return ['h' + depth];
    }
    case 'code': {
      return ['pre', getCodeBlockAttrs(node)];
    }
    case 'list': {
      let tagName = node.ordered ? 'ol' : 'ul';
      return [tagName];
    }
    case 'listItem': {
      return ['li'];
    }
    case 'thematicBreak': {
      return ['hr'];
    }
    // inline
    case 'strong': {
      return ['strong'];
    }
    case 'emphasis': {
      return ['em'];
    }
    case 'inlineCode': {
      return ['code'];
    }
    case 'link': {
      return ['a', getLinkAttrs(node)];
    }
    case 'image': {
      return ['img', getImageAttrs(node)];
    }
    default: {
      return ['span'];
    }
  }
}

function processNode(node: ASTNode): Node {
  if (node.type === 'text') {
    return new TextNode(node.value);
  }
  let childNodes;
  if (typeof node.value === 'string') {
    childNodes = [new TextNode(node.value)];
  } else {
    childNodes = node.children ? node.children.map(processNode) : [];
  }
  let [tagName, attrs] = parseNode(node);
  return new ElementNode(tagName, attrs, childNodes);
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
