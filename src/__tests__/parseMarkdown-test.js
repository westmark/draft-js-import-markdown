/* @flow */
const {describe, it} = global;
import expect from 'expect';
import parseMarkdown from '../parseMarkdown';
import {NODE_TYPE_ELEMENT} from 'synthetic-dom';
import fs from 'fs';
import {join} from 'path';

// This separates the test cases in `data/test-cases.txt`.
const SEP = '\n\n>>';
const DIV = '~~~~~~';

let testCasesRaw = fs.readFileSync(
  join(__dirname, '..', '..', 'test', 'test-cases.txt'),
  'utf8',
);

let testCases = testCasesRaw.slice(2).trim().split(SEP).map((text) => {
  let lines = text.split('\n');
  let description = lines.shift().trim();
  let index = lines.indexOf(DIV);
  let markdown = lines.slice(0, index).join('\n');
  let html = lines.slice(index + 1).join('\n');
  return {description, markdown, html};
});

describe('parseMarkdown', () => {
  it('should create dom nodes', () => {
    let markdown = 'Hello World';
    let element = parseMarkdown(markdown);
    expect(element.nodeType).toBe(NODE_TYPE_ELEMENT);
    let html = element.toString().slice(5, -6);
    expect(html).toBe('<p>Hello World</p>');
  });
});

describe('parseMarkdown', () => {
  testCases.forEach((testCase) => {
    let {description, markdown, html} = testCase;
    it(`should render ${description}`, () => {
      let element = parseMarkdown(markdown);
      let actualHTML = element.toString().slice(5, -6);
      console.log(actualHTML);
      expect(actualHTML).toBe(html);
    });
  });
});
