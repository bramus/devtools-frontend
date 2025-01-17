
// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as PerfUI from '../../../legacy/components/perf_ui/perf_ui.js';

const chart = new PerfUI.PieChart.PieChart();
document.getElementById('container')?.appendChild(chart);

chart.data = {
  chartName: 'Nice Chart',
  size: 110,
  formatter: (value): string => String(value) + ' %',
  showLegend: true,
  total: 100,
  slices: [{value: 75, color: 'crimson', title: 'Filling'}, {value: 25, color: 'burlywood', title: 'Crust'}],
};
