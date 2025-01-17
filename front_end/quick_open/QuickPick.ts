// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/* eslint-disable rulesdir/no_underscored_properties */

import * as Diff from '../diff/diff.js';
import * as UI from '../ui/legacy/legacy.js';  // eslint-disable-line no-unused-vars
import {FilteredListWidget, Provider} from './FilteredListWidget.js';
export interface QuickPickItem {
  label: string;
  description?: string;
  detail?: string;
}
export interface QuickPickOptions {
  placeHolder: string;
  matchOnDescription?: boolean;
  matchOnDetail?: boolean;
}

export class QuickPick {
  private constructor() {
    throw new ReferenceError('Instance type not implemented.');
  }

  static show(items: QuickPickItem[], options: QuickPickOptions): Promise<QuickPickItem|undefined> {
    let canceledPromise: Promise<undefined> =
        new Promise<undefined>(_r => {});  // Intentionally creates an unresolved promise
    const fulfilledPromise = new Promise<QuickPickItem>(resolve => {
      const provider =
          new QuickPickProvider(items, resolve, options.matchOnDescription ? 0.5 : 0, options.matchOnDetail ? 0.25 : 0);
      const widget = new FilteredListWidget(provider);
      widget.setPlaceholder(options.placeHolder);
      widget.setPromptTitle(options.placeHolder);
      widget.showAsDialog(options.placeHolder);
      canceledPromise = (widget.once('hidden') as Promise<undefined>);
      widget.setQuery('');
    });

    return Promise.race([fulfilledPromise, canceledPromise]).then(values => {
      // If it was fulfilled, then `result` will have a value.
      // If it was canceled, then `result` will be undefined.
      // Either way, it has the value that we want.
      return values;
    });
  }
}

class QuickPickProvider extends Provider {
  _resolve: Function;
  _items: QuickPickItem[];
  _matchOnDescription: number;
  _matchOnDetail: number;
  constructor(
      items: QuickPickItem[], resolve: Function, matchOnDescription: number|undefined = 0.5,
      matchOnDetail: number|undefined = 0.25) {
    super();
    this._resolve = resolve;
    this._items = items;
    this._matchOnDescription = matchOnDescription;
    this._matchOnDetail = matchOnDetail;
  }

  itemCount(): number {
    return this._items.length;
  }

  itemKeyAt(itemIndex: number): string {
    const item = this._items[itemIndex];
    let key = item.label;
    if (this._matchOnDescription) {
      key += ' ' + item.description;
    }
    if (this._matchOnDetail) {
      key += ' ' + item.detail;
    }
    return key;
  }

  itemScoreAt(itemIndex: number, query: string): number {
    const item = this._items[itemIndex];
    const test = query.toLowerCase();
    let score = Diff.Diff.DiffWrapper.characterScore(test, item.label.toLowerCase());

    if (this._matchOnDescription && item.description) {
      const descriptionScore = Diff.Diff.DiffWrapper.characterScore(test, item.description.toLowerCase());
      score += descriptionScore * this._matchOnDescription;
    }

    if (this._matchOnDetail && item.detail) {
      const detailScore = Diff.Diff.DiffWrapper.characterScore(test, item.detail.toLowerCase());
      score += detailScore * this._matchOnDetail;
    }

    return score;
  }

  renderItem(itemIndex: number, query: string, titleElement: Element, subtitleElement: Element): void {
    const item = this._items[itemIndex];
    titleElement.removeChildren();
    const labelElement = titleElement.createChild('span');
    UI.UIUtils.createTextChild(labelElement, item.label);
    FilteredListWidget.highlightRanges(titleElement, query, true);
    if (item.description) {
      const descriptionElement = titleElement.createChild('span', 'quickpick-description');
      UI.UIUtils.createTextChild(descriptionElement, item.description);
      if (this._matchOnDescription) {
        FilteredListWidget.highlightRanges(descriptionElement, query, true);
      }
    }
    if (item.detail) {
      UI.UIUtils.createTextChild(subtitleElement, item.detail);
      if (this._matchOnDetail) {
        FilteredListWidget.highlightRanges(subtitleElement, query, true);
      }
    }
  }

  renderAsTwoRows(): boolean {
    return this._items.some(i => Boolean(i.detail));
  }

  selectItem(itemIndex: number|null, _promptValue: string): void {
    if (typeof itemIndex === 'number') {
      this._resolve(this._items[itemIndex]);
      return;
    }

    this._resolve(undefined);
  }
}
