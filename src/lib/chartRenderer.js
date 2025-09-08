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
  COLOR_BACKGROUND: '#fcf1da',
  COLOR_AXIS: '#e08a1e',
  COLOR_SIGNS: '#a8732a',
  COLOR_ASPECTS: '#cccccc',
  
  // Planet colors (traditional Vedic colors)
  PLANET_COLORS: {
    'Sun': '#18a2b8',      // Teal-like as screenshot
    'Moon': '#315bff',     // Blue
    'Mars': '#e74c3c',     // Red
    'Mercury': '#2ecc71',  // Green
    'Jupiter': '#9b59b6',  // Purple
    'Venus': '#8a4b2a',    // Brown
    'Saturn': '#6f3c86',   // Violet
    'Rahu': '#2e7d32',     // Dark green
    'Ketu': '#2e7d32'      // Dark green
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

// Tamil sign names
const signNamesTa = {
  1: 'மேஷ', 2: 'ரிஷப', 3: 'மிதுன', 4: 'கடக',
  5: 'சிம்ம', 6: 'கன்னி', 7: 'துலா', 8: 'விருச்சிக',
  9: 'தனுசு', 10: 'மகர', 11: 'கும்ப', 12: 'மீன'
};

/**
 * Get sign name by number
 */
const getSignName = (signNumber) => {
  return signNames[signNumber] || 'Unknown';
};

const getSignNameTa = (signNumber) => {
  return signNamesTa[signNumber] || '';
};

// Short labels per locale
const planetShortLabelsEn = {
  Sun: 'Sun', Moon: 'Moo', Mars: 'Mar', Mercury: 'Mer',
  Jupiter: 'Jup', Venus: 'Ven', Saturn: 'Sat', Rahu: 'Rah', Ketu: 'Ket', ASC: 'Lag'
};

const planetShortLabelsTa = {
  Sun: 'சூ', Moon: 'சந்', Mars: 'செ', Mercury: 'பு',
  Jupiter: 'கு', Venus: 'சு', Saturn: 'சனி', Rahu: 'ரா', Ketu: 'கே', ASC: 'ல'
};

// Optional Tamil translations for header
const rasiChartTitle = { en: 'Rasi Chart', ta: 'ராசி கட்டம்' };

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
    // Determine available width and responsive layout
    const containerWidth = container.clientWidth || 600;
    const isWide = containerWidth >= 900;
    chartsContainer.style.cssText = `
      display: flex;
      flex-direction: ${isWide ? 'row' : 'column'};
      flex-wrap: ${isWide ? 'nowrap' : 'wrap'};
      gap: 30px;
      align-items: flex-start;
      justify-content: center;
      padding: 15px;
      margin-bottom: 30px;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    `;

    // Chart dimensions - responsive and with South larger than North
    const southWidth = isWide
      ? Math.min(containerWidth * 0.6, 560)
      : Math.min(containerWidth * 0.95, 560);
    const southHeight = southWidth;

    const northWidth = isWide
      ? Math.min(containerWidth * 0.35, 380)
      : Math.min(containerWidth * 0.9, 380);
    const northHeight = northWidth;

    // SOUTH INDIAN (English)
    const southWrapperEn = document.createElement('div');
    southWrapperEn.style.cssText = 'display:flex; flex-direction:column; align-items:center;';
    const southTitleEn = document.createElement('h4');
    southTitleEn.textContent = 'South Indian (English)';
    southTitleEn.style.cssText = 'margin: 0 0 10px 0; color: #333; text-align: center; font-size: 16px;';
    southWrapperEn.appendChild(southTitleEn);

    const southSvgEn = createSVGElement('svg', {
      width: southWidth,
      height: southHeight,
      viewBox: `0 0 ${southWidth} ${southHeight}`,
      style: `background: ${defaultChartConfig.COLOR_BACKGROUND}; border: 8px solid ${defaultChartConfig.COLOR_AXIS}; border-radius: 12px;`
    });
    drawSouthIndianKundli(southSvgEn, southWidth, southHeight, birthChartData, 'en');
    southWrapperEn.appendChild(southSvgEn);
    chartsContainer.appendChild(southWrapperEn);

    // SOUTH INDIAN (Tamil)
    const southWrapperTa = document.createElement('div');
    southWrapperTa.style.cssText = 'display:flex; flex-direction:column; align-items:center;';
    const southTitleTa = document.createElement('h4');
    southTitleTa.textContent = 'தென் இந்திய (தமிழ்)';
    southTitleTa.style.cssText = 'margin: 0 0 10px 0; color: #333; text-align: center; font-size: 16px;';
    southWrapperTa.appendChild(southTitleTa);

    const southSvgTa = createSVGElement('svg', {
      width: southWidth,
      height: southHeight,
      viewBox: `0 0 ${southWidth} ${southHeight}`,
      style: `background: ${defaultChartConfig.COLOR_BACKGROUND}; border: 8px solid ${defaultChartConfig.COLOR_AXIS}; border-radius: 12px;`
    });
    drawSouthIndianKundli(southSvgTa, southWidth, southHeight, birthChartData, 'ta');
    southWrapperTa.appendChild(southSvgTa);
    chartsContainer.appendChild(southWrapperTa);

    // NORTH INDIAN SECOND (right on wide screens)
    const northWrapper = document.createElement('div');
    northWrapper.style.cssText = 'display:flex; flex-direction:column; align-items:center;';
    const northTitle = document.createElement('h4');
    northTitle.textContent = 'North Indian Style (Diamond)';
    northTitle.style.cssText = 'margin: 0 0 10px 0; color: #333; text-align: center; font-size: 16px;';
    northWrapper.appendChild(northTitle);

    const northSvg = createSVGElement('svg', {
      width: northWidth,
      height: northHeight,
      viewBox: `0 0 ${northWidth} ${northHeight}`,
      style: `background: ${defaultChartConfig.COLOR_BACKGROUND}; border: 8px solid ${defaultChartConfig.COLOR_AXIS}; border-radius: 12px;`
    });
    drawNorthIndianKundli(northSvg, northWidth/2, northWidth * 0.3, birthChartData);
    northWrapper.appendChild(northSvg);
    chartsContainer.appendChild(northWrapper);

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
    fill: defaultChartConfig.COLOR_BACKGROUND,
    stroke: defaultChartConfig.COLOR_AXIS,
    'stroke-width': '6'
  });
  svg.appendChild(outerSquare);

  // Draw the diamond shape (rotated square)
  const diamondPath = `M ${center} ${center - size} L ${center + size} ${center} L ${center} ${center + size} L ${center - size} ${center} Z`;

  const diamond = createSVGElement('path', {
    d: diamondPath,
    fill: 'none',
    stroke: defaultChartConfig.COLOR_AXIS,
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
      stroke: defaultChartConfig.COLOR_AXIS,
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
      'font-size': '13',
      'font-weight': 'bold',
      fill: defaultChartConfig.COLOR_SIGNS,
      stroke: '#fff',
      'stroke-width': '2',
      'stroke-opacity': '0.9',
      style: 'paint-order: stroke fill'
    });
    houseText.textContent = label.house;
    svg.appendChild(houseText);
  });

  // Place planets in North Indian houses
  // Center title and nakshatra
  const title = createSVGElement('text', {
    x: center,
    y: center - 10,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-size': '16',
    'font-weight': '700',
    fill: '#7f7f7f',
    stroke: '#fff',
    'stroke-width': '1.5',
    'stroke-opacity': '0.8',
    style: 'paint-order: stroke fill'
  });
  title.textContent = 'Rasi Chart';
  svg.appendChild(title);

  const nakName = birthChartData?.nakshatras?.Moon?.name || '';
  const nakText = createSVGElement('text', {
    x: center,
    y: center + 12,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-size': '20',
    'font-weight': '800',
    fill: '#e67e22',
    stroke: '#fff',
    'stroke-width': '1.5',
    'stroke-opacity': '0.6',
    style: 'paint-order: stroke fill'
  });
  nakText.textContent = nakName;
  svg.appendChild(nakText);

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

  // Anchor planets to the same positions where house numbers are drawn
  const housePositions = [
    { house: 1,  x: center - size + 22, y: center },
    { house: 2,  x: center - size/2,    y: center - size/2 },
    { house: 3,  x: center - 28,        y: center - size + 26 },
    { house: 4,  x: center,             y: center - size + 26 },
    { house: 5,  x: center + 28,        y: center - size + 26 },
    { house: 6,  x: center + size/2,    y: center - size/2 },
    { house: 7,  x: center + size - 22, y: center },
    { house: 8,  x: center + size/2,    y: center + size/2 },
    { house: 9,  x: center + 22,        y: center + size - 26 },
    { house: 10, x: center,             y: center + size - 26 },
    { house: 11, x: center - 22,        y: center + size - 26 },
    { house: 12, x: center - size/2,    y: center + size/2 }
  ];

  // Place planets in houses with better positioning and details
  housePositions.forEach(housePos => {
    const planetsInHouse = planetsByHouse[housePos.house] || [];

    // Arrange planets in a 2-column grid to avoid overlaps
    const columns = 1; // stack vertically for clarity
    const rowHeight = 16;
    planetsInHouse.forEach((planet, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const px = housePos.x - 10 + (col * 28);
      const py = housePos.y + (row * rowHeight);

      const planetText = createSVGElement('text', {
        x: px,
        y: py,
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'font-size': '13',
        'font-weight': 'bold',
        fill: defaultChartConfig.PLANET_COLORS[planet.name] || '#333',
        stroke: '#fff',
        'stroke-width': '1.5',
        'stroke-opacity': '0.8',
        style: 'paint-order: stroke fill'
      });
      const shortLabel = planetShortLabelsEn[planet.name] || planet.symbol;
      planetText.textContent = `${shortLabel}${planet.retrograde ? 'R' : ''}`;
      svg.appendChild(planetText);

      const degreeText = createSVGElement('text', {
        x: px + 26,
        y: py,
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'font-size': '10',
        'font-weight': 'normal',
        fill: '#555',
        stroke: '#fff',
        'stroke-width': '1',
        'stroke-opacity': '0.7',
        style: 'paint-order: stroke fill'
      });
      degreeText.textContent = `${planet.degree}°`;
      svg.appendChild(degreeText);
    });
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
const drawSouthIndianKundli = (svg, width, height, birthChartData, locale = 'en') => {
  const margin = 40;
  const gridWidth = width - (margin * 2);
  const gridHeight = height - (margin * 2);
  const cellWidth = gridWidth / 4;
  const cellHeight = gridHeight / 4;

  // Draw the ornate outer frame (approximation)
  const frame = createSVGElement('rect', {
    x: margin - 20,
    y: margin - 20,
    width: gridWidth + 40,
    height: gridHeight + 40,
    rx: 8,
    ry: 8,
    fill: 'none',
    stroke: defaultChartConfig.COLOR_AXIS,
    'stroke-width': '6'
  });
  svg.appendChild(frame);

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
        fill: defaultChartConfig.COLOR_BACKGROUND,
        stroke: defaultChartConfig.COLOR_AXIS,
        'stroke-width': '2'
      });
      svg.appendChild(rect);
    }
  }

  // Title and Nakshatra in center
  const centerX = width / 2;
  const centerY = height / 2;
  const title = createSVGElement('text', {
    x: centerX,
    y: centerY - 10,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-size': '14',
    'font-weight': '700',
    fill: '#9b9b9b'
  });
  title.textContent = locale === 'ta' ? rasiChartTitle.ta : rasiChartTitle.en;
  svg.appendChild(title);

  // Moon nakshatra in bold orange
  const nakName = birthChartData?.nakshatras?.Moon?.name || '';
  const nakText = createSVGElement('text', {
    x: centerX,
    y: centerY + 18,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-size': '18',
    'font-weight': '800',
    fill: '#e67e22'
  });
  nakText.textContent = locale === 'ta' ? (birthChartData?.nakshatras?.Moon?.name_ta || nakName) : nakName;
  svg.appendChild(nakText);

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
        x: x + 6,
        y: y + 18,
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'font-size': '11',
        'font-weight': 'bold',
        fill: defaultChartConfig.COLOR_SIGNS
      });
      houseText.textContent = cell.house;
      svg.appendChild(houseText);

      // Add sign name (smaller text)
      const signName = locale === 'ta' ? getSignNameTa(cell.house) : getSignName(cell.house);
      const signText = createSVGElement('text', {
        x: x + 26,
        y: y + 18,
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'font-size': '9',
        'font-weight': 'normal',
        fill: '#888'
      });
      signText.textContent = locale === 'ta' ? signName : signName.substring(0, 3);
      svg.appendChild(signText);
    }
  });

  // Place planets in South Indian houses
  placePlanetsInSouthIndianHouses(svg, birthChartData, margin, cellWidth, cellHeight, southIndianHouses, locale);
};

/**
 * Place planets in South Indian houses (based on signs, not relative houses)
 */
const placePlanetsInSouthIndianHouses = (svg, birthChartData, margin, cellWidth, cellHeight, houseMapping, locale = 'en') => {
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
    symbol: locale === 'ta' ? 'ல' : 'Lag',
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
        const yPos = y + 40 + (index * 16);

        // Planet symbol
        const planetText = createSVGElement('text', {
          x: x + 10,
          y: yPos,
          'text-anchor': 'start',
          'dominant-baseline': 'middle',
          'font-size': '12',
          'font-weight': 'bold',
          fill: planet.name === 'ASC' ? '#ff6b35' : (defaultChartConfig.PLANET_COLORS[planet.name] || '#333')
        });
        const shortLabel = locale === 'ta' ? (planetShortLabelsTa[planet.name] || planet.symbol) : (planetShortLabelsEn[planet.name] || planet.symbol);
        planetText.textContent = `${shortLabel}${planet.retrograde ? 'R' : ''}`;
        svg.appendChild(planetText);

        // Planet degree (if not ASC)
        if (planet.name !== 'ASC') {
          const degreeText = createSVGElement('text', {
            x: x + 38,
            y: yPos,
            'text-anchor': 'start',
            'dominant-baseline': 'middle',
            'font-size': '9',
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
