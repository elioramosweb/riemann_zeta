// Scene.jsx
import React from 'react'
import PlaneWithShader from './PlaneWithShader'

export default function Scene() {
  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
      <PlaneWithShader/>
    </mesh>
  )
}
