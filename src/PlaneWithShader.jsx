// SphereWithShader.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial } from 'three'
import { DoubleSide } from 'three'

const vertexShader = `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
        vNormal = normal;
        vPosition = position;
        vUv = uv;
        vec3 newPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`

const fragmentShader = `
    #define ITERATIONS 500.
    #define PI 3.141592653589793
    #define NMAX 1000
    
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    
    float rand(float n){return fract(sin(n) * 43758.5453123);}

    float noise(float p){
      float fl = floor(p);
      float fc = fract(p);
      return mix(rand(fl), rand(fl + 1.0), fc);
    }

    vec3 hotPalette(float t) {
            float r = smoothstep(0.0, 0.5, t); 
            float g = smoothstep(0.25, 0.75, t); 
            float b = smoothstep(0.5, 1.0, t);
            float intensity = mix(0.50, 1.0, t);
            return vec3(r * intensity, g * intensity, b * intensity);
    }
    
    float lyapunov(vec2 coord) {
        float x = 0.5;
        float sum = 0.0;
        for(int i = 0; i < NMAX; i++) {
            int pos = int(mod(float(i),5.));
            float p = (pos == 0 || pos == 3 || pos == 0) ? 1.0 : 0.0;
            float r = mix(coord.x,coord.y,p);
                    x = r * x *(1.0 - x);
            sum += log(abs(r - 2.0 * r * x));
        }
        return sum/float(NMAX);
    }

    void main() {

        vec2 uv = vUv;

        uv.x += 2.98 - 0.255;
        uv.y += 3.03 - 0.054;
    
        float lyap = smoothstep(-1.0, 0.8, lyapunov(uv));
        vec3 col = hotPalette(lyap);
        float dist = distance(col,vec3(0.0));
        if (dist < 0.2)
        {
          col = vec3(0.0);
        }
        gl_FragColor = vec4(col, 1.0);
    }
`

export default function SphereWithShader() {
  const shaderRef = useRef();

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh position={[0,0,0]}>
      <planeGeometry args={[5, 5,64, 64]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 }
        }}
        side={DoubleSide}
      />
    </mesh>
  )
}
