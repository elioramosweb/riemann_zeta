// Scene.jsx
import React from 'react'
import PlaneWithShader from './PlaneWithShader'

export default function Scene() {
  return (
    <mesh position={[0, -2, 0]}>
      <PlaneWithShader/>
    </mesh>
  )
}
