// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {assert} from 'chai';
import * as puppeteer from 'puppeteer';

import {$$, click, goToResource, waitFor, waitForFunction} from '../../shared/helper.js';
import {describe, it} from '../../shared/mocha-extensions.js';
import {openSourcesPanel} from '../helpers/sources-helpers.js';

async function getIconComponents(className: string, root?: puppeteer.ElementHandle<Element>) {
  return await waitForFunction(async () => {
    const icons = await $$(`devtools-icon.${className}`, root);
    return icons.length > 0 ? icons : undefined;
  });
}

async function getRowsText(root: puppeteer.ElementHandle<Element>): Promise<string[]> {
  const rowMessages = await $$('.text-editor-row-message', root);
  const messages = [];
  for (const rowMessage of rowMessages) {
    const messageText = await rowMessage.evaluate(x => (x instanceof HTMLElement) ? x.innerText : '');
    messages.push(messageText);
  }
  return messages;
}

async function getIconFile(iconComponent: puppeteer.ElementHandle<Element>): Promise<string> {
  const issueIcon = await waitFor('.icon-basic', iconComponent);
  const imageSrc = await issueIcon.evaluate(x => window.getComputedStyle(x).backgroundImage);
  const splitImageSrc = imageSrc.substring(5, imageSrc.length - 2).split('/');
  return splitImageSrc[splitImageSrc.length - 1];
}

async function openFileInSourceTab(fileName: string) {
  await goToResource(`network/${fileName}`);
  await openSourcesPanel();
  const element = await waitFor(`[aria-label="${fileName}, file"]`);
  await element.click();
}

async function getExpandedIssuesTitle(): Promise<Set<string>> {
  const expandedIssues = new Set<string>();
  const issues = await $$('.issue');
  for (const issue of issues) {
    const expanded = await issue.evaluate(x => x.classList.contains('expanded'));
    if (expanded) {
      const titleHandler = await waitFor('.title', issue);
      const title = await titleHandler.evaluate(x => (x instanceof HTMLElement) ? x.innerText : '');
      expandedIssues.add(title);
    }
  }
  return expandedIssues;
}

async function waitForExpandedIssueTitle(issueIconComponent: puppeteer.ElementHandle<Element>): Promise<Set<string>> {
  return await waitForFunction(async () => {
    await click(issueIconComponent);
    const expandedIssues = await getExpandedIssuesTitle();
    if (expandedIssues.size) {
      return expandedIssues;
    }
    return undefined;
  });
}

describe('The row\'s icon bucket', async function() {
  if (this.timeout()) {
    this.timeout(10000);
  }

  it('should display error messages', async () => {
    await openFileInSourceTab('trusted-type-policy-violation-report-only.rawresponse');
    const iconComponents = await getIconComponents('text-editor-line-decoration-icon-error');
    const messages: string[] = [];
    const expectedMessages = [
      '[Report Only] Refused to create a TrustedTypePolicy named \'policy2\' because it violates the following Content Security Policy directive: "trusted-types policy1".',
    ];
    for (const iconComponent of iconComponents) {
      await iconComponent.hover();
      const vbox = await waitFor('div.vbox.flex-auto.no-pointer-events');
      const rowMessages = await getRowsText(vbox);
      messages.push(...rowMessages);
    }
    assert.deepEqual(messages, expectedMessages);
  });

  it('should use the correct error icon', async () => {
    await openFileInSourceTab('trusted-type-violations-report-only.rawresponse');
    const bucketIconComponents = await getIconComponents('text-editor-line-decoration-icon-error');
    for (const bucketIconComponent of bucketIconComponents) {
      await bucketIconComponent.hover();
      const vbox = await waitFor('div.vbox.flex-auto.no-pointer-events');
      const iconComponents = await getIconComponents('text-editor-row-message-icon', vbox);
      for (const iconComponent of iconComponents) {
        assert.strictEqual(await getIconFile(iconComponent), 'error_icon.svg');
      }
      assert.strictEqual(await getIconFile(bucketIconComponent), 'error_icon.svg');
    }
  });

  it('should display issue messages', async () => {
    await openFileInSourceTab('trusted-type-violations-report-only.rawresponse');
    const issueIconComponents = await getIconComponents('text-editor-line-decoration-icon-issue');

    const issueMessages: string[] = [];
    const expectedIssueMessages = [
      'Trusted Type policy creation blocked by Content Security Policy',
      'Trusted Type expected, but String received',
    ];
    for (const issueIconComponent of issueIconComponents) {
      await issueIconComponent.hover();
      const vbox = await waitFor('div.vbox.flex-auto.no-pointer-events');
      const rowMessages = await getRowsText(vbox);
      issueMessages.push(...rowMessages);
    }
    assert.deepEqual(issueMessages, expectedIssueMessages);
  });

  it('should also mark issues in inline event handlers in HTML documents', async () => {
    await openFileInSourceTab('trusted-type-violations-report-only-in-html.rawresponse');
    const icons = await getIconComponents('text-editor-line-decoration-icon-issue');
    assert.strictEqual(icons.length, 1);
  });

  // Flaky test.
  it.skipOnPlatforms(['mac'], '[crbug.com/1184162]: should reveal Issues tab when the icon is clicked', async () => {
    await openFileInSourceTab('trusted-type-policy-violation-report-only.rawresponse');

    const HIDE_DEBUGGER_SELECTOR = '[aria-label="Hide debugger"]';
    const HIDE_NAVIGATOR_SELECTOR = '[aria-label="Hide navigator"]';
    await click(HIDE_DEBUGGER_SELECTOR);
    await click(HIDE_NAVIGATOR_SELECTOR);

    const bucketIssueIconComponents = await getIconComponents('text-editor-line-decoration-icon-issue');
    assert.strictEqual(bucketIssueIconComponents.length, 1);
    const issueIconComponent = bucketIssueIconComponents[0];
    await click(issueIconComponent);

    const expandedIssues = await waitForExpandedIssueTitle(issueIconComponent);
    assert.isTrue(expandedIssues.has('Trusted Type policy creation blocked by Content Security Policy'));
  });

  it('should reveal the Issues tab if the icon in the popover is clicked', async () => {
    await openFileInSourceTab('trusted-type-violations-report-only.rawresponse');

    const HIDE_DEBUGGER_SELECTOR = '[aria-label="Hide debugger"]';
    const HIDE_NAVIGATOR_SELECTOR = '[aria-label="Hide navigator"]';
    await click(HIDE_DEBUGGER_SELECTOR);
    await click(HIDE_NAVIGATOR_SELECTOR);

    const bucketIssueIconComponents = await getIconComponents('text-editor-line-decoration-icon-issue');
    assert.strictEqual(bucketIssueIconComponents.length, 1);
    const issueIconComponent = bucketIssueIconComponents[0];
    await issueIconComponent.hover();

    const vbox = await waitFor('div.vbox.flex-auto.no-pointer-events');
    const rowMessage = await waitFor('.text-editor-row-message', vbox);
    const issueTitle = await rowMessage.evaluate(x => (x instanceof HTMLElement) ? x.innerText : '');
    const issueIcon = await waitFor('.text-editor-row-message-icon', rowMessage);
    await issueIcon.click();

    const expandedIssues = await waitForExpandedIssueTitle(issueIconComponent);
    assert.isTrue(expandedIssues.has(issueTitle));
  });
});
