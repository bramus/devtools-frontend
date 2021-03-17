// Copyright 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/* eslint-disable rulesdir/no_underscored_properties */

import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import * as i18n from '../i18n/i18n.js';
import * as QuickOpen from '../quick_open/quick_open.js';
import * as Workspace from '../workspace/workspace.js';  // eslint-disable-line no-unused-vars

import {FilteredUISourceCodeListProvider} from './FilteredUISourceCodeListProvider.js';
import {SourcesView} from './SourcesView.js';

const UIStrings = {
  /**
  *@description Text to open a file
  */
  openFile: 'Open file',
};
const str_ = i18n.i18n.registerUIStrings('sources/OpenFileQuickOpen.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);

let openFileQuickOpenInstance: OpenFileQuickOpen;

export class OpenFileQuickOpen extends FilteredUISourceCodeListProvider {
  static instance(opts: {
    forceNew: boolean|null,
  } = {forceNew: null}): OpenFileQuickOpen {
    const {forceNew} = opts;
    if (!openFileQuickOpenInstance || forceNew) {
      openFileQuickOpenInstance = new OpenFileQuickOpen();
    }

    return openFileQuickOpenInstance;
  }

  attach(): void {
    this.setDefaultScores(SourcesView.defaultUISourceCodeScores());
    super.attach();
  }

  uiSourceCodeSelected(
      uiSourceCode: Workspace.UISourceCode.UISourceCode|null, lineNumber?: number, columnNumber?: number): void {
    Host.userMetrics.actionTaken(Host.UserMetrics.Action.SelectFileFromFilePicker);

    if (!uiSourceCode) {
      return;
    }
    if (typeof lineNumber === 'number') {
      Common.Revealer.reveal(uiSourceCode.uiLocation(lineNumber, columnNumber));
    } else {
      Common.Revealer.reveal(uiSourceCode);
    }
  }

  filterProject(project: Workspace.Workspace.Project): boolean {
    return !project.isServiceProject();
  }

  renderAsTwoRows(): boolean {
    return true;
  }
}

QuickOpen.FilteredListWidget.registerProvider({
  prefix: '',
  title: i18nLazyString(UIStrings.openFile),
  provider: OpenFileQuickOpen.instance,
});