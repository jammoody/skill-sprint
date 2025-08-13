export default function handler(req, res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  res.status(200).json({
    day:{ title:'Value Proposition Sprint', knowledge:'A clear value prop tells who you help, the outcome, and why you are different.', task:'Write your one-sentence value proposition and ask 1 customer if it’s clear.', reflection:'Did they understand it immediately?' },
    tips:['Keep it under 20 words.','Outcome > features.']
  });
}
