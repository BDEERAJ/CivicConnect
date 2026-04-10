import PIL.Image
import io
import json
import google.generativeai as genai

class GeminiAnalyzerService:
    def __init__(self, model: genai.GenerativeModel):
        self.model = model

    def analyze_problem(self, image_bytes: bytes) -> dict:
        """Analyzes a single image to detect a community problem."""
        img = PIL.Image.open(io.BytesIO(image_bytes))
        
        prompt = """
Analyze the given image carefully for a social community platform and identify the most significant issue visible.

Focus on real-world problems that affect public spaces, safety, environment, or community well-being.

Possible categories include:
- Garbage or litter
- Potholes / road damage
- Drainage / water logging issues
- Public facility damage (streetlights, benches, etc.)
- Personal help / emergency situations
- Environmental issues (pollution, deforestation, water contamination)
- Other (if none of the above apply)

Examine the image in detail:
- Look for visible damage, hazards, or risks
- Consider environmental impact
- Identify if the issue affects public safety or daily life


Estimate a confidence score (0–100) based on how clearly the issue is visible.
The reply should be in atleast 150 words 
Provide a short, clear, and factual description of the problems.


Return ONLY a valid JSON object using this exact schema:
{
  "problem_type": "category name",
  "confidence": integer between 0-100,
  "description": "short clear description",
  "suggested_solution": "practical solution"
}
"""
        print("[AI Service] Generating response from Gemini...")
        response = self.model.generate_content(
            [prompt, img],
            generation_config={"response_mime_type": "application/json"}
        )
        
        try:
            result = json.loads(response.text)
            return result
        except json.JSONDecodeError as e:
            raise ValueError(f"Gemini returned invalid JSON: {response.text[:200]}")

    def verify_resolution(self, original_bytes: bytes, resolved_bytes: bytes) -> dict:
        """Compares two images to verify if a problem was resolved."""
        original_img = PIL.Image.open(io.BytesIO(original_bytes))
        resolved_img = PIL.Image.open(io.BytesIO(resolved_bytes))
        
        prompt = """
        You are an AI inspector verifying if a reported community infrastructure or environmental problem has been fixed.
        Image 1: The original reported problem.
        Image 2: The new image claiming the problem is resolved.
        
        Compare the two images. Determine how well the issue was fixed and identify anything that was done poorly or left unresolved.
        
        Return ONLY a valid JSON object using this exact schema:
        {
          "is_resolved": boolean,
          "accuracy_score": integer between 0-100,
          "what_is_missing": "Detailed string describing what is left unfixed, done poorly, or still unsafe. Say 'None' if perfectly fixed.",
          "remarks": "A brief overall evaluation of the work"
        }
        """
        response = self.model.generate_content(
            [prompt, original_img, resolved_img],
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)