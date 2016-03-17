/* @flow */

import parseMarkdown from './parseMarkdown';
import {stateFromElement} from 'draft-js-import-element';

import type {ContentState} from 'draft-js';

export default function stateFromMarkdown(markdown: string, opts: Object): ContentState {
  let element = parseMarkdown(markdown, opts);
  return stateFromElement(element);
}
