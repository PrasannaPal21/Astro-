// Custom browser-compatible chart renderer using SVG

/**
 * Default chart configuration for Vedic astrology
 */
const defaultChartConfig = {
  CHART_TYPE: 'radix',
  CHART_STYLE: 'vedic',
  CHART_STROKE: 2,
  CHART_STROKE_OPACITY: 0.8,
  CHART_FILL_OPACITY: 0.1,
  CHART_PADDING: 20,
  
  // Colors
  COLOR_BACKGROUND: '#ffffff',
  COLOR_AXIS: '#333333',
  COLOR_SIGNS: '#666666',
  COLOR_ASPECTS: '#cccccc',
  
  // Planet colors (traditional Vedic colors)
  PLANET_COLORS: {
    'Sun': '#ff6b35',      // Orange-red
    'Moon': '#4a90e2',     // Blue
    'Mars': '#e74c3c',     // Red
    'Mercury': '#2ecc71',  // Green
    'Jupiter': '#f39c12',  // Yellow-orange
    'Venus': '#9b59b6',    // Purple
    'Saturn': '#34495e',   // Dark blue-gray
    'Rahu': '#8e44ad',     // Dark purple
    'Ketu': '#95a5a6'      // Gray
  },
  
  // House system
  HOUSES_STROKE: 1,
  HOUSES_FILL_OPACITY: 0.05,
  
  // Aspects
  ASPECTS_STROKE: 1,
  ASPECTS_OPACITY: 0.6,
  
  // Symbols
  SYMBOL_SCALE: 1,
  SYMBOL_AXIS_FONT_SIZE: 12,
  SYMBOL_SIGNS_FONT_SIZE: 14,
  SYMBOL_PLANETS_FONT_SIZE: 12
};

/**
 * Planet symbols for display
 */
const planetSymbols = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Rahu': '☊',
  'Ketu': '☋'
};

/**
 * Sign symbols for display
 */
const signSymbols = {
  1: '♈', 2: '♉', 3: '♊', 4: '♋', 5: '♌', 6: '♍',
  7: '♎', 8: '♏', 9: '♐', 10: '♑', 11: '♒', 12: '♓'
};

/**
 * Sign names
 */
const signNames = {
  1: 'Aries', 2: 'Taurus', 3: 'Gemini', 4: 'Cancer',
  5: 'Leo', 6: 'Virgo', 7: 'Libra', 8: 'Scorpio',
  9: 'Sagittarius', 10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces'
};

/**
 * Get sign name by number
 */
const getSignName = (signNumber) => {
  return signNames[signNumber] || 'Unknown';
};

/**
 * Map planet names from jyotish-calculations to AstroChart format
 * @param {string} planetName - Planet name from jyotish calculations
 * @returns {string} Planet name for AstroChart
 */
const mapPlanetName = (planetName) => {
  const nameMap = {
    'Sun': 'Sun',
    'Moon': 'Moon',
    'Mars': 'Mars',
    'Mercury': 'Mercury',
    'Jupiter': 'Jupiter',
    'Venus': 'Venus',
    'Saturn': 'Saturn',
    'Rahu': 'NNode',  // North Node
    'Ketu': 'SNode'   // South Node
  };
  
  return nameMap[planetName] || planetName;
};

/**
 * Create SVG element with attributes
 */
const createSVGElement = (tag, attributes = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

/**
 * Create and render both North and South Indian style Kundli charts using SVG
 * @param {string} containerId - ID of the HTML element to render chart in
 * @param {Object} birthChartData - Birth chart data from calculations
 * @param {Object} customConfig - Custom configuration options
 * @returns {Object} Chart instance with destroy method
 */
export const renderChart = (containerId, birthChartData, customConfig = {}) => {
  try {
    // Get container element
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with ID '${containerId}' not found`);
    }

    // Clear any existing content
    container.innerHTML = '';

    // Create container for both charts
    const chartsContainer = document.createElement('div');
    chartsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 30px;
      align-items: center;
      padding: 15px;
      margin-bottom: 30px;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    `;

    // Chart dimensions - responsive to container size
    const containerWidth = container.clientWidth || 600;
    const chartWidth = Math.min(containerWidth * 0.8, 350); // 80% of container width, max 350px
    const chartHeight = chartWidth;

    // Create North Indian Chart
    const northTitle = document.createElement('h4');
    northTitle.textContent = 'North Indian Style (Diamond)';
    northTitle.style.cssText = 'margin: 0 0 10px 0; color: #333; text-align: center; font-size: 16px;';
    chartsContainer.appendChild(northTitle);

    const northSvg = createSVGElement('svg', {
      width: chartWidth,
      height: chartHeight,
      viewBox: `0 0 ${chartWidth} ${chartHeight}`,
      style: 'background: white; border: 2px solid #ddd; border-radius: 8px;'
    });

    drawNorthIndianKundli(northSvg, chartWidth/2, chartWidth * 0.3, birthChartData);
    chartsContainer.appendChild(northSvg);

    // Create South Indian Chart
    const southTitle = document.createElement('h4');
    southTitle.textContent = 'South Indian Style (Grid)';
    southTitle.style.cssText = 'margin: 0 0 10px 0; color: #333; text-align: center; font-size: 16px;';
    chartsContainer.appendChild(southTitle);

    const southSvg = createSVGElement('svg', {
      width: chartWidth,
      height: chartHeight,
      viewBox: `0 0 ${chartWidth} ${chartHeight}`,
      style: 'background: white; border: 2px solid #ddd; border-radius: 8px;'
    });

    drawSouthIndianKundli(southSvg, chartWidth, chartHeight, birthChartData);
    chartsContainer.appendChild(southSvg);

    container.appendChild(chartsContainer);

    return {
      destroy: () => {
        container.innerHTML = '';
      }
    };

  } catch (error) {
    console.error('Error rendering chart:', error);
    throw new Error(`Chart rendering failed: ${error.message}`);
  }
};

/**
 * Draw the North Indian style diamond Kundli structure
 */
const drawNorthIndianKundli = (svg, center, boxSize, birthChartData) => {
  const size = boxSize * 1.5; // Make it larger for better visibility

  // Draw the outer square border
  const outerSquare = createSVGElement('rect', {
    x: center - size,
    y: center - size,
    width: size * 2,
    height: size * 2,
    fill: 'white',
    stroke: '#000',
    'stroke-width': '3'
  });
  svg.appendChild(outerSquare);

  // Draw the diamond shape (rotated square)
  const diamondPath = `M ${center} ${center - size} L ${center + size} ${center} L ${center} ${center + size} L ${center - size} ${center} Z`;

  const diamond = createSVGElement('path', {
    d: diamondPath,
    fill: 'none',
    stroke: '#000',
    'stroke-width': '3'
  });
  svg.appendChild(diamond);

  // Draw the X lines (diagonals of the outer square)
  const xLines = [
    // Top-left to bottom-right diagonal
    { x1: center - size, y1: center - size, x2: center + size, y2: center + size },
    // Top-right to bottom-left diagonal
    { x1: center + size, y1: center - size, x2: center - size, y2: center + size }
  ];

  xLines.forEach(line => {
    svg.appendChild(createSVGElement('line', {
      x1: line.x1,
      y1: line.y1,
      x2: line.x2,
      y2: line.y2,
      stroke: '#000',
      'stroke-width': '2'
    }));
  });

  // Add house numbers in traditional North Indian diamond positions
  const houseLabels = [
    // House 1 - Left point of diamond (Ascendant)
    { house: 1, x: center - size + 20, y: center },
    // House 2 - Top-left triangle
    { house: 2, x: center - size/2, y: center - size/2 },
    // House 3 - Top-left of top point
    { house: 3, x: center - 20, y: center - size + 20 },
    // House 4 - Top point of diamond
    { house: 4, x: center, y: center - size + 20 },
    // House 5 - Top-right of top point
    { house: 5, x: center + 20, y: center - size + 20 },
    // House 6 - Top-right triangle
    { house: 6, x: center + size/2, y: center - size/2 },
    // House 7 - Right point of diamond
    { house: 7, x: center + size - 20, y: center },
    // House 8 - Bottom-right triangle
    { house: 8, x: center + size/2, y: center + size/2 },
    // House 9 - Bottom-right of bottom point
    { house: 9, x: center + 20, y: center + size - 20 },
    // House 10 - Bottom point of diamond
    { house: 10, x: center, y: center + size - 20 },
    // House 11 - Bottom-left of bottom point
    { house: 11, x: center - 20, y: center + size - 20 },
    // House 12 - Bottom-left triangle
    { house: 12, x: center - size/2, y: center + size/2 }
  ];

  houseLabels.forEach(label => {
    const houseText = createSVGElement('text', {
      x: label.x,
      y: label.y,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': '10',
      'font-weight': 'bold',
      fill: '#666'
    });
    houseText.textContent = label.house;
    svg.appendChild(houseText);
  });

  // Place planets in North Indian houses
  placePlanetsInNorthIndianHouses(svg, birthChartData, center, size);
};

/**
 * Place planets in North Indian houses
 */
const placePlanetsInNorthIndianHouses = (svg, birthChartData, center, boxSize) => {
  const { planetaryPositions, ascendant } = birthChartData;
  const size = boxSize * 1.5;

  // Calculate which house each planet is in
  const ascendantSign = Math.floor(ascendant.longitude / 30) + 1;

  // Group planets by house
  const planetsByHouse = {};

  Object.entries(planetaryPositions).forEach(([planetName, data]) => {
    const planetSign = Math.floor(data.longitude / 30) + 1;
    // Calculate house number relative to ascendant
    let house = planetSign - ascendantSign + 1;
    if (house <= 0) house += 12;
    if (house > 12) house -= 12;

    if (!planetsByHouse[house]) {
      planetsByHouse[house] = [];
    }
    planetsByHouse[house].push({
      name: planetName,
      symbol: planetSymbols[planetName] || planetName.substring(0, 2),
      degree: Math.floor(data.longitude % 30),
      retrograde: data.retrograde
    });
  });

  // Define house positions for planet placement in diamond layout with better spacing
  const housePositions = [
    // House 1 - Left point (Ascendant area)
    { x: center - size + 25, y: center + 10, house: 1, width: 40 },
    // House 2 - Top-left triangle
    { x: center - size/2 - 15, y: center - size/2 + 10, house: 2, width: 35 },
    // House 3 - Top-left of top point
    { x: center - 35, y: center - size + 30, house: 3, width: 30 },
    // House 4 - Top point
    { x: center - 15, y: center - size + 30, house: 4, width: 30 },
    // House 5 - Top-right of top point
    { x: center + 5, y: center - size + 30, house: 5, width: 30 },
    // House 6 - Top-right triangle
    { x: center + size/2 - 20, y: center - size/2 + 10, house: 6, width: 35 },
    // House 7 - Right point
    { x: center + size - 65, y: center + 10, house: 7, width: 40 },
    // House 8 - Bottom-right triangle
    { x: center + size/2 - 20, y: center + size/2 - 10, house: 8, width: 35 },
    // House 9 - Bottom-right of bottom point
    { x: center + 5, y: center + size - 55, house: 9, width: 30 },
    // House 10 - Bottom point
    { x: center - 15, y: center + size - 55, house: 10, width: 30 },
    // House 11 - Bottom-left of bottom point
    { x: center - 35, y: center + size - 55, house: 11, width: 30 },
    // House 12 - Bottom-left triangle
    { x: center - size/2 - 15, y: center + size/2 - 10, house: 12, width: 35 }
  ];

  // Place planets in houses with better positioning and details
  housePositions.forEach(housePos => {
    const planetsInHouse = planetsByHouse[housePos.house] || [];

    // If multiple planets, arrange them more compactly
    if (planetsInHouse.length > 2) {
      // Compact layout for many planets
      planetsInHouse.forEach((planet, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;

        const planetText = createSVGElement('text', {
          x: housePos.x + (col * 20),
          y: housePos.y + (row * 12),
          'text-anchor': 'start',
          'dominant-baseline': 'middle',
          'font-size': '9',
          'font-weight': 'bold',
          fill: defaultChartConfig.PLANET_COLORS[planet.name] || '#333'
        });
        planetText.textContent = `${planet.symbol}${planet.retrograde ? 'R' : ''}`;
        svg.appendChild(planetText);
      });
    } else {
      // Normal layout for 1-2 planets
      planetsInHouse.forEach((planet, index) => {
        // Planet symbol
        const planetText = createSVGElement('text', {
          x: housePos.x,
          y: housePos.y + (index * 14),
          'text-anchor': 'start',
          'dominant-baseline': 'middle',
          'font-size': '10',
          'font-weight': 'bold',
          fill: defaultChartConfig.PLANET_COLORS[planet.name] || '#333'
        });
        planetText.textContent = `${planet.symbol}${planet.retrograde ? 'R' : ''}`;
        svg.appendChild(planetText);

        // Planet degree (smaller text next to symbol)
        const degreeText = createSVGElement('text', {
          x: housePos.x + 22,
          y: housePos.y + (index * 14),
          'text-anchor': 'start',
          'dominant-baseline': 'middle',
          'font-size': '7',
          'font-weight': 'normal',
          fill: '#666'
        });
        degreeText.textContent = `${planet.degree}°`;
        svg.appendChild(degreeText);
      });
    }
  });

  // Add ascendant marker in house 1
  const ascendantText = createSVGElement('text', {
    x: center - size + 5,
    y: center - 20,
    'text-anchor': 'start',
    'dominant-baseline': 'middle',
    'font-size': '10',
    'font-weight': 'bold',
    fill: '#ff6b35'
  });
  ascendantText.textContent = 'ASC';
  svg.appendChild(ascendantText);
};

/**
 * Draw the South Indian style grid Kundli structure
 */
const drawSouthIndianKundli = (svg, width, height, birthChartData) => {
  const margin = 50;
  const gridWidth = width - (margin * 2);
  const gridHeight = height - (margin * 2);
  const cellWidth = gridWidth / 4;
  const cellHeight = gridHeight / 4;

  // Draw the 4x4 grid
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = margin + (col * cellWidth);
      const y = margin + (row * cellHeight);

      // Draw cell border
      const rect = createSVGElement('rect', {
        x: x,
        y: y,
        width: cellWidth,
        height: cellHeight,
        fill: 'white',
        stroke: '#000',
        'stroke-width': '2'
      });
      svg.appendChild(rect);
    }
  }

  // South Indian house mapping (fixed positions - houses don't rotate)
  const southIndianHouses = [
    // Row 0 (Top row)
    { house: 2, row: 0, col: 0 }, { house: 3, row: 0, col: 1 },
    { house: 4, row: 0, col: 2 }, { house: 5, row: 0, col: 3 },
    // Row 1 (Middle row)
    { house: 1, row: 1, col: 0 }, { house: null, row: 1, col: 1 },
    { house: null, row: 1, col: 2 }, { house: 6, row: 1, col: 3 },
    // Row 2 (Middle row)
    { house: 12, row: 2, col: 0 }, { house: null, row: 2, col: 1 },
    { house: null, row: 2, col: 2 }, { house: 7, row: 2, col: 3 },
    // Row 3 (Bottom row)
    { house: 11, row: 3, col: 0 }, { house: 10, row: 3, col: 1 },
    { house: 9, row: 3, col: 2 }, { house: 8, row: 3, col: 3 }
  ];

  // Add house numbers and planets
  southIndianHouses.forEach(cell => {
    if (cell.house) {
      const x = margin + (cell.col * cellWidth);
      const y = margin + (cell.row * cellHeight);

      // Add house number
      const houseText = createSVGElement('text', {
        x: x + 5,
        y: y + 15,
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'font-size': '10',
        'font-weight': 'bold',
        fill: '#666'
      });
      houseText.textContent = cell.house;
      svg.appendChild(houseText);

      // Add sign name (smaller text)
      const signName = getSignName(cell.house);
      const signText = createSVGElement('text', {
        x: x + 20,
        y: y + 15,
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'font-size': '8',
        'font-weight': 'normal',
        fill: '#888'
      });
      signText.textContent = signName.substring(0, 3); // First 3 letters
      svg.appendChild(signText);
    }
  });

  // Place planets in South Indian houses
  placePlanetsInSouthIndianHouses(svg, birthChartData, margin, cellWidth, cellHeight, southIndianHouses);
};

/**
 * Place planets in South Indian houses (based on signs, not relative houses)
 */
const placePlanetsInSouthIndianHouses = (svg, birthChartData, margin, cellWidth, cellHeight, houseMapping) => {
  const { planetaryPositions, ascendant } = birthChartData;

  // In South Indian style, planets are placed by their zodiac signs (1-12), not houses
  // Group planets by their zodiac sign
  const planetsBySign = {};

  Object.entries(planetaryPositions).forEach(([planetName, data]) => {
    const planetSign = Math.floor(data.longitude / 30) + 1; // 1-12 for Aries to Pisces

    if (!planetsBySign[planetSign]) {
      planetsBySign[planetSign] = [];
    }
    planetsBySign[planetSign].push({
      name: planetName,
      symbol: planetSymbols[planetName] || planetName.substring(0, 2),
      degree: Math.floor(data.longitude % 30),
      retrograde: data.retrograde
    });
  });

  // Add ascendant to its sign
  const ascendantSign = Math.floor(ascendant.longitude / 30) + 1;
  if (!planetsBySign[ascendantSign]) {
    planetsBySign[ascendantSign] = [];
  }
  planetsBySign[ascendantSign].push({
    name: 'ASC',
    symbol: 'ASC',
    degree: Math.floor(ascendant.longitude % 30),
    retrograde: false
  });

  // Map signs to South Indian house positions
  const signToHouseMap = {
    1: 1,   // Aries -> House 1
    2: 2,   // Taurus -> House 2
    3: 3,   // Gemini -> House 3
    4: 4,   // Cancer -> House 4
    5: 5,   // Leo -> House 5
    6: 6,   // Virgo -> House 6
    7: 7,   // Libra -> House 7
    8: 8,   // Scorpio -> House 8
    9: 9,   // Sagittarius -> House 9
    10: 10, // Capricorn -> House 10
    11: 11, // Aquarius -> House 11
    12: 12  // Pisces -> House 12
  };

  // Place planets in their sign positions
  houseMapping.forEach(cell => {
    if (cell.house) {
      // Find which sign corresponds to this house position
      const signInThisPosition = cell.house;
      const planetsInSign = planetsBySign[signInThisPosition] || [];

      const x = margin + (cell.col * cellWidth);
      const y = margin + (cell.row * cellHeight);

      planetsInSign.forEach((planet, index) => {
        const yPos = y + 35 + (index * 14);

        // Planet symbol
        const planetText = createSVGElement('text', {
          x: x + 8,
          y: yPos,
          'text-anchor': 'start',
          'dominant-baseline': 'middle',
          'font-size': '10',
          'font-weight': 'bold',
          fill: planet.name === 'ASC' ? '#ff6b35' : (defaultChartConfig.PLANET_COLORS[planet.name] || '#333')
        });
        planetText.textContent = `${planet.symbol}${planet.retrograde ? 'R' : ''}`;
        svg.appendChild(planetText);

        // Planet degree (if not ASC)
        if (planet.name !== 'ASC') {
          const degreeText = createSVGElement('text', {
            x: x + 35,
            y: yPos,
            'text-anchor': 'start',
            'dominant-baseline': 'middle',
            'font-size': '7',
            'font-weight': 'normal',
            fill: '#666'
          });
          degreeText.textContent = `${planet.degree}°`;
          svg.appendChild(degreeText);
        }
      });
    }
  });
};

/**
 * Create a responsive chart that adjusts to container size
 * @param {string} containerId - ID of the HTML element
 * @param {Object} birthChartData - Birth chart data
 * @param {Object} customConfig - Custom configuration
 * @returns {Object} Chart instance with resize handler
 */
export const renderResponsiveChart = (containerId, birthChartData, customConfig = {}) => {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container element with ID '${containerId}' not found`);
  }

  // Initial render
  const chart = renderChart(containerId, birthChartData, customConfig);

  // Add resize handler
  const resizeHandler = () => {
    // Re-render chart on resize
    chart.destroy();
    renderChart(containerId, birthChartData, customConfig);
  };

  window.addEventListener('resize', resizeHandler);

  return {
    chart,
    destroy: () => {
      window.removeEventListener('resize', resizeHandler);
      if (chart && chart.destroy) {
        chart.destroy();
      }
    }
  };
};

/**
 * Generate chart configuration for different chart types
 * @param {string} chartType - Type of chart ('birth', 'navamsa', 'transit')
 * @returns {Object} Chart configuration
 */
export const getChartConfig = (chartType = 'birth') => {
  const configs = {
    birth: {
      ...defaultChartConfig,
      CHART_STROKE: 2,
      COLOR_BACKGROUND: '#ffffff'
    },
    navamsa: {
      ...defaultChartConfig,
      CHART_STROKE: 1,
      COLOR_BACKGROUND: '#f8f9fa',
      SYMBOL_SCALE: 0.8
    },
    transit: {
      ...defaultChartConfig,
      CHART_STROKE: 1,
      COLOR_BACKGROUND: '#fff3cd',
      ASPECTS_OPACITY: 0.3
    }
  };
  
  return configs[chartType] || configs.birth;
};
