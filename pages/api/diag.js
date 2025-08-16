// pages/api/diag.js

export default function handler(req, res) {
  const passFromHeader = req.headers['x-ss-ai-passcode'] || '';

  const hasKey = !!process.env.OPENAI_API_KEY;
  const hasPassVar = !!process.env.SS_AI_PASSCODE;
  const passProvided = !!passFromHeader;
  const passMatches =
    hasPassVar && String(passFromHeader) === String(process.env.SS_AI_PASSCODE);

  res.status(200).json({
    hasKey,
    hasPassVar,
    passProvided,
    passMatches,
  });
}
