export default function handler(req, res) {
  const passFromHeader = req.headers['x-ss-ai-passcode'] || '';
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  const hasPassVar = Boolean(process.env.SS_AI_PASSCODE);
  const passMatches = hasPassVar && (String(passFromHeader) === String(process.env.SS_AI_PASSCODE));
  res.status(200).json({
    hasKey,
    hasPassVar,
    passProvided: Boolean(passFromHeader),
    passMatches
  });
}
