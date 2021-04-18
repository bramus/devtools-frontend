// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {PathCommands} from './common.js';
import {buildPath, drawPathWithLineStyle, emptyBounds, LineStyle} from './highlight_common.js';

export interface ContainmentContextHighlight {
  containerBorder: PathCommands;
  isBoth: boolean;
  isInline: boolean;
  isBlock: boolean;
  containerWidth: number;
  containerHeight: number;
  containmentContextHighlightConfig: {
    containerBorder?: LineStyle,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function drawContainmentContextHighlight(
    highlight: ContainmentContextHighlight, context: CanvasRenderingContext2D, deviceScaleFactor: number,
    canvasWidth: number, canvasHeight: number, emulationScaleFactor: number) {
  const config = highlight.containmentContextHighlightConfig;
  const bounds = emptyBounds();
  const borderPath = buildPath(highlight.containerBorder, bounds, emulationScaleFactor);
  const {isBoth, isInline, isBlock} = highlight;  // eslint-disable-line @typescript-eslint/no-unused-vars
  drawPathWithLineStyle(context, borderPath, config.containerBorder);

  // @TODO: Draw Width/Height on top of element? Needs design doc …

  return;
}
