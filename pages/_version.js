// pages/_version.js
export default function Version(){
  return (
    <main style={{fontFamily:'system-ui',padding:24}}>
      <h1>Skill Sprint UI — Pack v3 ✅</h1>
      <p>{new Date().toISOString()}</p>
      <ul>
        <li>Nav present</li>
        <li>Coach chat with links + sprint</li>
        <li>Sprint suggestions + expanders</li>
        <li>KPIs editor</li>
        <li>Learn pages</li>
      </ul>
    </main>
  );
}
