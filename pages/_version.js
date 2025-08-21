// pages/_version.js
export default function Version(){
  return <pre style={{padding:16}}>
{`Skill Sprint – version stamp
Built: ${new Date().toISOString()}`}
  </pre>;
}