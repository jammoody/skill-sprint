// pages/api/generate-sprint.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { day } = req.body;
    if (!day) {
      return res.status(400).json({ error: 'Missing day parameter' });
    }

    // For now, return a mock sprint until AI wiring is added
    const mockSprint = {
      title: `Day ${day} — Skill Sprint`,
      knowledge: "Here’s something new to learn today.",
      task: "Try applying this knowledge in a small, real-world task.",
      reflection: "Think about how this new skill might help you long-term."
    };

    return res.status(200).json(mockSprint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
