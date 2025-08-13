import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { profile, history=[] } = req.body || {}
  try {
    const sys = `You are Skill Sprint, a business micro-coach. Create concise, practical daily sprints.
Return JSON ONLY like:
{"day":{"title":"","knowledge":"2-3 sentences","task":"1 actionable task","reflection":"a brief reflection question"},"tips":["",""]}
Use the user's profile and recent history to avoid repetition and keep momentum.`

    const user = `USER PROFILE:\n${JSON.stringify(profile)}\nRECENT HISTORY (last 5 entries):\n${JSON.stringify(history.slice(-5))}`

    const chat = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ],
      max_tokens: 450,
      temperature: 0.4
    })

    const text = chat.choices?.[0]?.message?.content || ""
    let json
    try { json = JSON.parse(text) } catch (e) {
      // Fallback minimal plan
      json = { day:{ title:"Value Proposition Sprint", knowledge:"A clear value proposition states who you help, what outcome you deliver, and how you're different.", task:"Write your one-sentence value proposition and share it with one customer.", reflection:"Did the customer understand it immediately?" }, tips:["Keep it under 20 words.","Focus on outcomes, not features."] }
    }
    return res.status(200).json(json)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'OpenAI request failed' })
  }
}
