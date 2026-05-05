export default function WorldScene() {
  return <>
    <color attach="background" args={["#bfe9ff"]} />
    <ambientLight intensity={0.65} />
    <directionalLight position={[8,12,5]} intensity={1.0} castShadow />
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
      <circleGeometry args={[70,48]} />
      <meshStandardMaterial color="#aeea9f" />
    </mesh>
    {Array.from({length:24}).map((_,i)=> <group key={i} position={[Math.sin(i*2.7)*24,0,Math.cos(i*3.4)*24]}>
      <mesh position={[0,1,0]}><cylinderGeometry args={[0.18,0.26,1.9,8]}/><meshStandardMaterial color="#8d5a3b"/></mesh>
      <mesh position={[0,2.25,0]}><sphereGeometry args={[0.9,12,12]}/><meshStandardMaterial color="#84d296"/></mesh>
    </group>)}
  </>;
}
