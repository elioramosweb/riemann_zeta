import { useRef,useEffect,useMemo} from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial } from 'three'
import { DoubleSide } from 'three'
import { GUI } from 'dat.gui'
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js'

function mobius(u, t, target) {
  // u ∈ [0, 1], t ∈ [0, 1]
  u *= Math.PI * 2
  t = (t - 0.5) * 1// rango [-1, 1]

  const major = 1.0
  const a = 0.5

  const x = Math.cos(u) * (major + t * Math.cos(u / 2))
  const y = Math.sin(u) * (major + t * Math.cos(u / 2))
  const z = t * Math.sin(u / 2)

  target.set(x, y, z)
}

const vertexShader = `
    uniform float uTime;
    uniform float uZoom;
    uniform float uDisplaceX;
    uniform float uDisplaceY;
    uniform float uMagPhase;

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

    uniform float uTime;
    uniform float uZoom;
    uniform float uDisplaceX;
    uniform float uDisplaceY;
    uniform float uMagPhase;
  
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    float map(float value, float min1, float max1, float min2, float max2) {
      return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }



    vec2 as_polar(vec2 z) {
      return vec2(
        length(z),
        atan(z.y, z.x)
      );
    }

    vec3 palette(float t) {
        return 0.5 + 0.5 * sin(6.28318 * (t + vec3(0.1, 0.3, 0.5)));
    }

    vec2 riemann_zeta_series(vec2 s) {
        vec2 sum = vec2(0.0);
        for (float n = 1.0; n < ITERATIONS; n += 1.0) {
            float term = pow(n, -s.x); // n^(-x)
            float angle = -s.y * log(n);
            sum += term * vec2(cos(angle), sin(angle)); // Parte real e imaginaria
        }
        return sum;
    }


    vec2 cx_log(vec2 a) {
      vec2 polar = as_polar(a);
      float rpart = polar.x;
      float ipart = polar.y;
      if (ipart > PI) ipart = ipart - (2.0 * PI);
      return vec2(log(rpart), ipart);
    }

    vec2 g(vec2 f)
    {
      return ceil(cx_log(f)) - log(abs(f)); 
    }

    mat2 rotate2d(float a) {
      return mat2(cos(a), -sin(a), sin(a), cos(a));
    }

    void main() {
      vec2 uv = vUv - 0.5;
      uv = vec2(uv.y,uv.x);
      uv *= uZoom;
      uv.x += uDisplaceX;
      uv.y += uDisplaceY;
      uv.x *= 0.025;
      //uv.x += uTime * 0.1;
      uv.y -= uTime*2.0;
      //uv.y = abs(uv.y);
      vec2 sum = (riemann_zeta_series(uv));
      float mag   = length(sum); 
      float phase = atan(sum.y,sum.x);
      vec3 col1 = palette(phase);
      vec3 col2 = palette(mag);
      vec3 col = mix(col1,col2,uMagPhase);
      //float d = length(uv);
      if (uv.x < 0.)
      {
        col = vec3(0.);
      }
      gl_FragColor = vec4(col, 1.0);
    }
`

  export default function PlaneWithShader() {
  const shaderRef = useRef();

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

    // Añade GUI una sola vez al montar
    useEffect(() => {
      if (!shaderRef.current) return
  
      const gui = new GUI()
      const uniforms = shaderRef.current.uniforms
  
      gui.add(uniforms.uZoom, 'value', 0.1, 100.0, 0.01).name('Zoom')
      gui.add(uniforms.uDisplaceX, 'value', -5.0, 50.0, 0.01).name('Desplazamiento X')
      gui.add(uniforms.uDisplaceY, 'value', -5.0, 50.0, 0.01).name('Desplazamiento Y')
      gui.add(uniforms.uMagPhase, 'value', 0.0, 1.0, 0.01).name('MagPhase')
  
      // Limpia la GUI al desmontar el componente
      return () => {
        gui.destroy()
      }
    }, [])


    function MobiusStrip() {
      const geometry = useMemo(() => {
        return new ParametricGeometry(mobius, 100, 20)
      }, [])
    
      return (
        <mesh geometry={geometry}>
          <meshStandardMaterial color="orange" side={DoubleSide} />
          <shaderMaterial
         ref={shaderRef}
         vertexShader={vertexShader}
         fragmentShader={fragmentShader}
         uniforms={{
           uTime: { value: 0 },
           uZoom:{value: 60.53},
           uDisplaceX:{value:46.16},
           uDisplaceY:{value:-5},
           uMagPhase:{value:1.},
         }}
         side={DoubleSide}
       />
        </mesh>
      )
    }


    return (MobiusStrip())

  // return (
  //   <mesh position={[0,0,0]}>
  //     <cylinderGeometry args={[1, 1, 1, 64, 1, true]} /> 
  //     <shaderMaterial
  //       ref={shaderRef}
  //       vertexShader={vertexShader}
  //       fragmentShader={fragmentShader}
  //       uniforms={{
  //         uTime: { value: 0 },
  //         uZoom:{value: 1.0},
  //         uDisplaceX:{value:1.0},
  //         uDisplaceY:{value:0.65},
  //         uMagPhase:{value:0.},
  //       }}
  //       side={DoubleSide}
  //     />
  //   </mesh>
  // )
}
