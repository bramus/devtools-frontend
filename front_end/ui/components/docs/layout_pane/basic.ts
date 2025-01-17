// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Common from '../../../../core/common/common.js';
import * as Elements from '../../../../panels/elements/elements.js';
import * as ComponentHelpers from '../../helpers/helpers.js';

await ComponentHelpers.ComponentServerSetup.setup();

const component = new Elements.LayoutPane.LayoutPane();

document.getElementById('container')?.appendChild(component);

component.data = {
  gridElements: [
    {
      id: 1,
      name: 'div',
      domId: 'foo',
      color: 'blue',
      enabled: false,
      reveal: (): void => {},
      setColor: (): void => {},
      toggle: (): void => {},
      highlight: (): void => {},
      hideHighlight: (): void => {},
    },
    {
      id: 2,
      name: 'div',
      domClasses: ['for', 'bar', 'some-very-long-class-name-very-very-very-very-very-long'],
      enabled: true,
      color: 'blue',
      reveal: (): void => {},
      setColor: (): void => {},
      toggle: (): void => {},
      highlight: (): void => {},
      hideHighlight: (): void => {},
    },
  ],
  settings: [
    {
      name: 'showGridTracks',
      type: Common.Settings.SettingType.BOOLEAN,
      value: false,
      title: 'Show grid tracks',
      options: [
        {
          title: 'Show grid tracks',
          value: true,
        },
        {
          title: 'Do not show grid tracks',
          value: false,
        },
      ],
    },
    {
      name: 'showGridBorders',
      type: Common.Settings.SettingType.ENUM,
      value: 'both',
      title: 'Show grid borders',
      options: [
        {
          title: 'Show grid borders',
          value: 'both',
        },
        {
          title: 'Do not show grid borders',
          value: 'none',
        },
      ],
    },
  ],
};
