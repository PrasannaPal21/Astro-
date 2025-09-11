// Gemini AI service for astrological analysis

/**
 * Send birth chart data to Gemini AI for analysis
 * @param {Object} chartData - Birth chart data
 * @param {Object} birthInfo - Birth information
 * @returns {Promise<string>} AI-generated analysis
 */
export const analyzeBirthChart = async (chartData, birthInfo) => {
  try {
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
    }
    
    // Prepare the data for Gemini
    const analysisData = prepareDataForGemini(chartData, birthInfo);
    
    // Create the prompt
    const prompt = createAnalysisPrompt(analysisData);
    
    // Call Gemini API
    const response = await callGeminiAPI(prompt, apiKey);
    
    return response;
  } catch (error) {
    console.error('Error analyzing birth chart with Gemini:', error);
    throw new Error(`Failed to analyze birth chart: ${error.message}`);
  }
};

/**
 * Prepare birth chart data for Gemini analysis
 */
const prepareDataForGemini = (chartData, birthInfo) => {
  const planetaryPositions = {};
  const nakshatras = {};
  
  // Extract planetary positions
  if (chartData.planetaryPositions) {
    Object.entries(chartData.planetaryPositions).forEach(([planet, data]) => {
      const sign = Math.floor(data.longitude / 30) + 1;
      const degree = Math.floor(data.longitude % 30);
      planetaryPositions[planet] = {
        sign: sign,
        degree: degree,
        retrograde: data.retrograde || false
      };
    });
  }
  
  // Extract nakshatras
  if (chartData.nakshatras) {
    Object.entries(chartData.nakshatras).forEach(([planet, data]) => {
      nakshatras[planet] = {
        name: data.name,
        pada: data.pada
      };
    });
  }
  
  // Extract ascendant
  const ascendant = chartData.ascendant ? {
    sign: Math.floor(chartData.ascendant.longitude / 30) + 1,
    degree: Math.floor(chartData.ascendant.longitude % 30)
  } : null;
  
  return {
    birthInfo: {
      name: birthInfo.name,
      date: birthInfo.date,
      time: birthInfo.time,
      location: birthInfo.location
    },
    planetaryPositions,
    nakshatras,
    ascendant
  };
};

/**
 * Create a comprehensive prompt for Gemini analysis
 */
const createAnalysisPrompt = (data) => {
  const signNames = {
    1: 'Aries', 2: 'Taurus', 3: 'Gemini', 4: 'Cancer',
    5: 'Leo', 6: 'Virgo', 7: 'Libra', 8: 'Scorpio',
    9: 'Sagittarius', 10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces'
  };
  
  let prompt = `You are an expert Vedic astrologer. Analyze this birth chart and provide insights about this person's personality, strengths, challenges, and life path.

BIRTH DETAILS:
- Name: ${data.birthInfo.name}
- Date: ${data.birthInfo.date}
- Time: ${data.birthInfo.time}
- Location: ${data.birthInfo.location}

PLANETARY POSITIONS:`;

  // Add planetary positions
  Object.entries(data.planetaryPositions).forEach(([planet, info]) => {
    const signName = signNames[info.sign];
    prompt += `\n- ${planet}: ${signName} ${info.degree}°${info.retrograde ? ' (Retrograde)' : ''}`;
  });

  // Add ascendant
  if (data.ascendant) {
    const ascSignName = signNames[data.ascendant.sign];
    prompt += `\n- Ascendant (Lagna): ${ascSignName} ${data.ascendant.degree}°`;
  }

  // Add nakshatras
  if (Object.keys(data.nakshatras).length > 0) {
    prompt += `\n\nNAKSHATRAS:`;
    Object.entries(data.nakshatras).forEach(([planet, info]) => {
      prompt += `\n- ${planet}: ${info.name} (Pada ${info.pada})`;
    });
  }

  prompt += `\n\nPlease provide a comprehensive analysis covering:
1. Personality traits and characteristics
2. Strengths and talents
3. Potential challenges and areas for growth
4. Career inclinations and life path
5. Relationship patterns
6. Health considerations
7. Spiritual inclinations
8. Overall life guidance and recommendations

Make the analysis insightful, practical, and encouraging. Use Vedic astrology principles and provide specific, actionable insights.`;

  return prompt;
};

/**
 * Call Gemini API
 */
const callGeminiAPI = async (prompt, apiKey) => {
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}. ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
};

