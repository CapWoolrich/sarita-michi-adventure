import { useMemo } from 'react';
const THEMES = {
  'mystic-forest': { bg:'#dff3cf', fog:'#e8f9de', ground:'#a8d08d' }, 'sakura-city': { bg:'#ffd8ec', fog:'#ffe8f3', ground:'#e8d2c5' },
  'crystal-lake': { bg:'#cdeeff', fog:'#e0f5ff', ground:'#b8d9c5' }, 'mist-grove': { bg:'#d8e0db', fog:'#e4ece7', ground:'#a6bea9' },
  'pastel-port': { bg:'#ffe3cd', fog:'#ffeede', ground:'#d8c8b8' }, 'cloud-valley': { bg:'#d8e9ff', fog:'#edf5ff', ground:'#c8d8c8' },
  'moon-garden': { bg:'#3b4274', fog:'#6069a8', ground:'#5b5f86' }, 'cotton-beach': { bg:'#b7ecff', fog:'#d6f6ff', ground:'#f6ddb4' },
  'aurora-mountain': { bg:'#29355a', fog:'#3f5179', ground:'#5c6f82' }, 'stellar-village': { bg:'#2b2450', fog:'#4d4380', ground:'#655782' }
};

export default function WorldScene({ worldTheme='mystic-forest' }) {
  const theme = THEMES[worldTheme] ?? THEMES['mystic-forest'];
  const particles = useMemo(()=>Array.from({length:24},(_,i)=>[Math.sin(i*1.9)*14,1+(i%4),Math.cos(i*2.1)*13]),[]);
  return <>
    <color attach="background" args={[theme.bg]} /><fog attach="fog" args={[theme.fog,24,90]} />
    <ambientLight intensity={0.72} /><hemisphereLight args={['#f9f1ff', theme.ground, 0.8]} /><directionalLight position={[10,18,8]} intensity={0.9} color="#ffe8c8" />
    <mesh rotation={[-Math.PI/2,0,0]}><circleGeometry args={[76,64]}/><meshStandardMaterial color={theme.ground} roughness={0.96}/></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}><ringGeometry args={[4,17,48]}/><meshStandardMaterial color="#f8eac8" transparent opacity={0.45}/></mesh>
    {Array.from({length:14}).map((_,i)=><group key={i} position={[Math.sin(i*1.4)*22,0,Math.cos(i*1.7)*20]}><mesh position={[0,1.8,0]}><cylinderGeometry args={[0.26,0.4,3.6,8]}/><meshStandardMaterial color="#8b5e41"/></mesh><mesh position={[0,4.2,0]}><sphereGeometry args={[1.6,10,10]}/><meshStandardMaterial color={i%2?'#89cc8b':'#7db4d6'}/></mesh></group>)}
    {worldTheme.includes('lake') || worldTheme.includes('beach') || worldTheme.includes('port') ? <mesh rotation={[-Math.PI/2,0,0]} position={[16,0.03,0]}><planeGeometry args={[24,42]}/><meshStandardMaterial color="#97dcff" transparent opacity={0.7}/></mesh> : null}
    {Array.from({length:8}).map((_,i)=><mesh key={`house-${i}`} position={[Math.sin(i*0.8)*18,1.1,Math.cos(i*0.9)*18]} visible={['sakura-city','pastel-port','stellar-village'].includes(worldTheme)}><boxGeometry args={[1.6,1.4,1.6]}/><meshStandardMaterial color={['#ffd6ea','#ffe5be','#d8dbff'][i%3]}/></mesh>)}
    {particles.map((p, i)=><mesh key={`p-${i}`} position={p}><sphereGeometry args={[0.08,6,6]}/><meshBasicMaterial color={i%2?'#fff0ac':'#e0f8ff'} transparent opacity={0.4}/></mesh>)}
  </>;
}
