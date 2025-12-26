const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Flight Analysis Service
 * Performs risk assessment and provides reasoning based on real aviation data
 */
class FlightAnalysisService {
  /**
   * Analyze flight for risk factors
   * @param {Object} flightPlan - Flight plan data
   * @returns {Promise<Object>} Risk assessment with factors and confidence
   */
  static async analyzeFlightRisk(flightPlan) {
    const {
      departure,
      destination,
      departureTime,
      aircraft,
      altitude,
      metarData,
      tafData,
      notamData,
    } = flightPlan;

    try {
      // Build context from real data
      let context = `Flight Analysis Request:\n`;
      context += `- From: ${departure}\n`;
      context += `- To: ${destination}\n`;
      context += `- Aircraft: ${aircraft || 'Not specified'}\n`;
      context += `- Altitude: ${altitude || 'Not specified'} feet\n`;
      context += `- Departure: ${departureTime || 'Not specified'}\n\n`;

      // Add METAR context
      if (metarData) {
        context += `DEPARTURE METAR:\n`;
        context += `- Wind: ${metarData.wind?.direction}° at ${metarData.wind?.speed}kt`;
        if (metarData.wind?.gust) context += ` gusts ${metarData.wind.gust}kt`;
        context += `\n`;
        context += `- Visibility: ${metarData.visibility?.value} SM\n`;
        context += `- Ceiling: ${metarData.ceiling?.coverage} ${metarData.ceiling?.altitude}ft\n`;
        context += `- Temperature: ${metarData.temperature?.celsius}°C\n`;
        context += `- Flight Category: ${metarData.flightCategory}\n\n`;
      }

      // Add TAF context
      if (tafData) {
        context += `DESTINATION TAF: Available for forecast analysis\n\n`;
      }

      // Add NOTAM context
      if (notamData && notamData.length > 0) {
        context += `ACTIVE NOTAMs:\n`;
        notamData.forEach(notam => {
          if (notam.affectsFlightPlanning) {
            context += `- [${notam.severity.toUpperCase()}] ${notam.description}\n`;
          }
        });
        context += `\n`;
      }

      // Call GPT for analysis
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert aviation safety analyst. Analyze the flight plan and provided real data (METAR, TAF, NOTAMs) and provide:
1. A risk score (0-1, where 0 is safe and 1 is extreme risk)
2. Specific risk factors identified
3. Your confidence level (low/medium/high)

Return ONLY valid JSON with this structure:
{
  "riskScore": 0.0-1.0,
  "riskLevel": "low|medium|high|critical",
  "factors": ["factor1", "factor2"],
  "recommendations": ["rec1", "rec2"],
  "confidence": "low|medium|high"
}`,
          },
          {
            role: 'user',
            content: context,
          },
        ],
        temperature: 0.3, // Lower temp for consistent risk assessment
        max_tokens: 500,
      });

      const analysisText = completion.choices[0]?.message?.content || '{}';
      
      // Parse JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (e) {
        // Fallback if JSON parsing fails
        analysis = {
          riskScore: 0.5,
          riskLevel: 'medium',
          factors: ['Unable to parse analysis'],
          recommendations: [],
          confidence: 'low',
        };
      }

      // Ensure required fields
      analysis.riskScore = Math.max(0, Math.min(1, analysis.riskScore || 0.5));
      analysis.riskLevel = analysis.riskLevel || this.getRiskLevel(analysis.riskScore);
      analysis.factors = Array.isArray(analysis.factors) ? analysis.factors : [];
      analysis.recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
      analysis.confidence = analysis.confidence || 'medium';
      analysis.timestamp = new Date().toISOString();
      analysis.dataUsed = {
        hasMETAR: !!metarData,
        hasTAF: !!tafData,
        hasNOTAM: !!(notamData && notamData.length > 0),
      };

      return analysis;

    } catch (error) {
      console.error('Flight analysis error:', error.message);
      throw new Error(`Flight analysis failed: ${error.message}`);
    }
  }

  /**
   * Determine risk level from score
   * @param {number} score - Risk score 0-1
   * @returns {string} Risk level
   */
  static getRiskLevel(score) {
    if (score < 0.2) return 'low';
    if (score < 0.5) return 'medium';
    if (score < 0.8) return 'high';
    return 'critical';
  }

  /**
   * Weather condition assessment
   * @param {Object} metar - METAR data
   * @returns {Object} Weather assessment
   */
  static assessWeatherConditions(metar) {
    if (!metar) return null;

    const assessment = {
      windConcern: false,
      visibilityConcern: false,
      ceilingConcern: false,
      temperatureConcern: false,
    };

    // Check wind
    if (metar.wind?.speed > 20) assessment.windConcern = true;

    // Check visibility
    if (metar.visibility?.value < 3) assessment.visibilityConcern = true;

    // Check ceiling
    if (metar.ceiling?.altitude < 1000) assessment.ceilingConcern = true;

    // Check temperature
    if (metar.temperature?.celsius < -25) assessment.temperatureConcern = true;

    return assessment;
  }

  /**
   * NOTAM impact assessment
   * @param {Array} notams - NOTAMs array
   * @returns {Array} Critical NOTAMs
   */
  static assessNotamImpact(notams) {
    if (!Array.isArray(notams)) return [];

    return notams.filter(notam => 
      notam.affectsFlightPlanning || 
      notam.severity === 'critical' ||
      notam.severity === 'high'
    );
  }
}

module.exports = FlightAnalysisService;
