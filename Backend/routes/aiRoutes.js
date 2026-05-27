import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert software architecture diagram generator for a whiteboard app.
Respond ONLY with a valid JSON array. No explanation, no markdown, just raw JSON.

AVAILABLE SHAPE TYPES:
- rectangle: { "type": "rectangle", "x": number, "y": number, "width": number, "height": number, "text": string, "color": string, "strokeColor": string }
- circle:    { "type": "circle", "x": number, "y": number, "radius": number, "text": string, "color": string, "strokeColor": string }
- arrow:     { "type": "arrow", "x1": number, "y1": number, "x2": number, "y2": number, "strokeColor": string }

STRICT RULES:
1. Canvas size: 1100x650. Use full space.
2. ALL text labels go INSIDE shapes via the "text" field. NEVER create standalone text/label shapes.
3. Generate 8-12 shapes minimum for any architecture.
4. Rectangle size: width=180, height=60 always.
5. Space boxes at least 100px apart horizontally, 120px vertically.

ARROW COORDINATES — calculate precisely from box edges:
- To connect two rectangles horizontally:
  x1 = sourceBox.x + sourceBox.width  (right edge)
  y1 = sourceBox.y + 30               (vertical center)
  x2 = targetBox.x                    (left edge)
  y2 = targetBox.y + 30               (vertical center)
- To connect vertically:
  x1 = sourceBox.x + 90              (horizontal center)
  y1 = sourceBox.y + sourceBox.height (bottom edge)
  x2 = targetBox.x + 90              (horizontal center)
  y2 = targetBox.y                    (top edge)

COLOR CODING (strictly follow):
- User/Client/Frontend  → "color": "#dbeafe", "strokeColor": "#2563eb"
- API Gateway/Proxy     → "color": "#ffedd5", "strokeColor": "#ea580c"
- Auth/Security         → "color": "#ede9fe", "strokeColor": "#7c3aed"
- Backend Services      → "color": "#dcfce7", "strokeColor": "#16a34a"
- Database/Storage      → "color": "#fef9c3", "strokeColor": "#ca8a04"
- Queue/Cache/Redis      → "color": "#fce7f3", "strokeColor": "#db2777"
- All arrows            → "strokeColor": "#94a3b8"

LAYOUT PATTERN (left to right flow):
Column 1 (x=60):   User-facing clients
Column 2 (x=320):  Gateway / Load Balancer
Column 3 (x=580):  Core services
Column 4 (x=840):  Data layer (DB, Cache, Storage)

Example for a chat app:
[
  {"type":"circle","x":60,"y":270,"radius":35,"text":"User","color":"#dbeafe","strokeColor":"#2563eb"},
  {"type":"rectangle","x":160,"y":150,"width":180,"height":60,"text":"Mobile App","color":"#dbeafe","strokeColor":"#2563eb"},
  {"type":"rectangle","x":160,"y":300,"width":180,"height":60,"text":"Web App","color":"#dbeafe","strokeColor":"#2563eb"},
  {"type":"rectangle","x":400,"y":225,"width":180,"height":60,"text":"API Gateway","color":"#ffedd5","strokeColor":"#ea580c"},
  {"type":"rectangle","x":640,"y":100,"width":180,"height":60,"text":"Auth Service","color":"#ede9fe","strokeColor":"#7c3aed"},
  {"type":"rectangle","x":640,"y":225,"width":180,"height":60,"text":"Chat Service","color":"#dcfce7","strokeColor":"#16a34a"},
  {"type":"rectangle","x":640,"y":350,"width":180,"height":60,"text":"File Service","color":"#dcfce7","strokeColor":"#16a34a"},
  {"type":"rectangle","x":880,"y":150,"width":180,"height":60,"text":"PostgreSQL","color":"#fef9c3","strokeColor":"#ca8a04"},
  {"type":"rectangle","x":880,"y":290,"width":180,"height":60,"text":"Redis Cache","color":"#fce7f3","strokeColor":"#db2777"},
  {"type":"arrow","x1":340,"y1":180,"x2":400,"y2":255,"strokeColor":"#94a3b8"},
  {"type":"arrow","x1":340,"y1":330,"x2":400,"y2":255,"strokeColor":"#94a3b8"},
  {"type":"arrow","x1":580,"y1":255,"x2":640,"y2":130,"strokeColor":"#94a3b8"},
  {"type":"arrow","x1":580,"y1":255,"x2":640,"y2":255,"strokeColor":"#94a3b8"},
  {"type":"arrow","x1":580,"y1":255,"x2":640,"y2":380,"strokeColor":"#94a3b8"},
  {"type":"arrow","x1":820,"y1":255,"x2":880,"y2":180,"strokeColor":"#94a3b8"},
  {"type":"arrow","x1":820,"y1":255,"x2":880,"y2":320,"strokeColor":"#94a3b8"}
]`;

router.post("/generate", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt?.trim()) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",   
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user",   content: prompt },
            ],
            temperature: 0.3,      
            max_tokens: 2048,
        });

        const raw = completion.choices[0].message.content.trim();

        
        const clean = raw.replace(/```json|```/g, "").trim();
        const shapes = JSON.parse(clean);
        
        // console.log("Groq returned shapes:", JSON.stringify(shapes, null, 2));

        res.json({ shapes });
    } catch (err) {
        console.error("AI generation error:", err.message);
        res.status(500).json({ error: "AI generation failed" });
    }
});

export default router;