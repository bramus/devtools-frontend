// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as i18n from '../../core/i18n/i18n.js';

import type {MarkdownIssueDescription} from './Issue.js';
import {Issue, IssueKind, IssueCategory} from './Issue.js';
import type * as SDK from '../../core/sdk/sdk.js';

const UIStrings = {
  /**
  *@description Label for the link for SharedArrayBuffer Issues
  */
  enablingSharedArrayBuffer: 'Enabling `SharedArrayBuffer`',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/SharedArrayBufferIssue.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);

export class SharedArrayBufferIssue extends Issue {
  private issueDetails: Protocol.Audits.SharedArrayBufferIssueDetails;

  constructor(issueDetails: Protocol.Audits.SharedArrayBufferIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel) {
    const umaCode = [Protocol.Audits.InspectorIssueCode.SharedArrayBufferIssue, issueDetails.type].join('::');
    super({code: Protocol.Audits.InspectorIssueCode.SharedArrayBufferIssue, umaCode}, issuesModel);
    this.issueDetails = issueDetails;
  }

  getCategory(): IssueCategory {
    return IssueCategory.Other;
  }

  details(): Protocol.Audits.SharedArrayBufferIssueDetails {
    return this.issueDetails;
  }

  getDescription(): MarkdownIssueDescription {
    return {
      file: 'sharedArrayBuffer.md',
      substitutions: undefined,
      links: [{
        link: 'https://developer.chrome.com/blog/enabling-shared-array-buffer/',
        linkTitle: i18nString(UIStrings.enablingSharedArrayBuffer),
      }],
    };
  }

  primaryKey(): string {
    return JSON.stringify(this.issueDetails);
  }

  getKind(): IssueKind {
    if (this.issueDetails.isWarning) {
      return IssueKind.BreakingChange;
    }
    return IssueKind.PageError;
  }

  static fromInspectorIssue(
      issuesModel: SDK.IssuesModel.IssuesModel,
      inspectorDetails: Protocol.Audits.InspectorIssueDetails): SharedArrayBufferIssue[] {
    const sabIssueDetails = inspectorDetails.sharedArrayBufferIssueDetails;
    if (!sabIssueDetails) {
      console.warn('SAB transfer issue without details received.');
      return [];
    }
    return [new SharedArrayBufferIssue(sabIssueDetails, issuesModel)];
  }
}
