// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import type * as ConsoleCountersModule from '../../../../panels/console_counters/console_counters.js';
import type * as IssuesManager from '../../../../models/issues_manager/issues_manager.js';

await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();

const ConsoleCounters: typeof ConsoleCountersModule =
    await import('../../../../panels/console_counters/console_counters.js');

function appendComponent(data: ConsoleCountersModule.IssueCounter.IssueCounterData) {
  const component = new ConsoleCounters.IssueCounter.IssueCounter();
  component.data = data;
  document.getElementById('container')?.appendChild(component);
}

const mockIssueManager = {
  addEventListener(): void{},
  removeEventListener(): void{},
  numberOfIssues(): number {
    return 1;
  },
} as unknown as IssuesManager.IssuesManager.IssuesManager;

appendComponent({issuesManager: mockIssueManager});

appendComponent({issuesManager: mockIssueManager, clickHandler: () => {}});
