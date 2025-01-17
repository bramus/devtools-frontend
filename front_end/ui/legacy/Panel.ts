// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint-disable rulesdir/no_underscored_properties */

import {SearchableView} from './SearchableView.js';  // eslint-disable-line no-unused-vars
import {SplitWidget} from './SplitWidget.js';
import {VBox} from './Widget.js';

export class Panel extends VBox {
  _panelName: string;

  constructor(name: string) {
    super();

    this.element.classList.add('panel');
    this.element.setAttribute('aria-label', name);
    this.element.classList.add(name);
    this._panelName = name;

    // @ts-ignore: Legacy global. Requires rewriting tests to get rid of.
    // For testing.
    UI.panels[name] = this;
  }

  get name(): string {
    return this._panelName;
  }

  searchableView(): SearchableView|null {
    return null;
  }

  elementsToRestoreScrollPositionsFor(): Element[] {
    return [];
  }
}

export class PanelWithSidebar extends Panel {
  _panelSplitWidget: SplitWidget;
  _mainWidget: VBox;
  _sidebarWidget: VBox;

  constructor(name: string, defaultWidth?: number) {
    super(name);

    this._panelSplitWidget = new SplitWidget(true, false, this._panelName + 'PanelSplitViewState', defaultWidth || 200);
    this._panelSplitWidget.show(this.element);

    this._mainWidget = new VBox();
    this._panelSplitWidget.setMainWidget(this._mainWidget);

    this._sidebarWidget = new VBox();
    this._sidebarWidget.setMinimumSize(100, 25);
    this._panelSplitWidget.setSidebarWidget(this._sidebarWidget);

    this._sidebarWidget.element.classList.add('panel-sidebar');
  }

  panelSidebarElement(): Element {
    return this._sidebarWidget.element;
  }

  mainElement(): Element {
    return this._mainWidget.element;
  }

  splitWidget(): SplitWidget {
    return this._panelSplitWidget;
  }
}
