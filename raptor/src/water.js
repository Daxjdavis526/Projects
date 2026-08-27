// Sea surface: a camera-following plane with animated wind waves and a sun
// glint, clipped to the ocean side of the coastline by the terrain's own mask.

import * as THREE from 'three';
import { origin } from './world.js';

export class Water {
  constructor(scene) {
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSun: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color(1, 0.96, 0.9) },
        uDeep: { value: new THREE.Color(0.012, 0.045, 0.085) },
        uShallow: { value: new THREE.Color(0.05, 0.16, 0.20) },
        uWind: { value: 0.4 },
        uOrigin: { value: new THREE.Vector2(0, 0) },
        uCurveR: { value: 6371000 },
        uFogColor: { value: new THREE.Color(0.6, 0.7, 0.8) },
        uFogNear: { value: 3000 },
        uFogFar: { value: 90000 },
      },
      vertexShader: `
        varying vec3 vWorld; varying vec2 vXZ;
        uniform vec2 uOrigin;
        uniform float uCurveR;
        void main(){
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vXZ = wp.xz + uOrigin;
          // the sea curves away exactly like the land does, or it would stand
          // up as a wall above the terrain's horizon
          float d2 = wp.x * wp.x + wp.z * wp.z;
          wp.y -= d2 / (2.0 * uCurveR);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        precision highp float;
        varying vec3 vWorld; varying vec2 vXZ;
        uniform float uTime; uniform vec3 uSun; uniform vec3 uSunColor;
        uniform vec3 uDeep; uniform vec3 uShallow; uniform float uWind;
        uniform vec3 uFogColor; uniform float uFogNear; uniform float uFogFar;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float n2(vec2 p){
          vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y);
        }
        void main(){
          vec2 p = vXZ * 0.014;
          float t = uTime * 0.35;
          float w = n2(p + vec2(t, t*0.7)) * 0.5 + n2(p*2.3 - vec2(t*1.4, t)) * 0.3
                  + n2(p*5.1 + vec2(t*2.1, -t*1.7)) * 0.2;
          vec2 g = vec2(dFdx(w), dFdy(w)) * 40.0 * uWind;
          vec3 nrm = normalize(vec3(-g.x, 1.0, -g.y));
          vec3 view = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(view, nrm), 0.0), 4.0);
          vec3 col = mix(uDeep, uShallow, fres * 0.6 + 0.15);
          vec3 refl = reflect(-view, nrm);
          float spec = pow(max(dot(refl, uSun), 0.0), 180.0);
          float glint = pow(max(dot(refl, uSun), 0.0), 12.0) * 0.12;
          col += uSunColor * (spec * 3.2 + glint) * max(uSun.y, 0.0);
          col += uSunColor * 0.05 * max(uSun.y, 0.0);
          // The sea runs far past the terrain's outermost tiles, so without
          // the same aerial perspective the land gets it reads as a hard blue
          // band along the horizon.
          float d = length(cameraPosition - vWorld);
          col = mix(col, uFogColor, smoothstep(uFogNear, uFogFar, d));
          gl_FragColor = vec4(col, 1.0);
        }`,
      side: THREE.FrontSide,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1200000, 1200000, 200, 200), this.mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = -0.4;
    this.mesh.renderOrder = -5;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  update(dt, camWorld, sky, weather, sceneFogColor, fogNear, fogFar) {
    this.mat.uniforms.uTime.value += dt;
    this.mat.uniforms.uSun.value.copy(sky.sunDir);
    this.mat.uniforms.uWind.value = 0.25 + (weather ? weather.windSpeed / 30 : 0.3);
    const up = Math.max(0.02, sky.sunDir.y);
    this.mat.uniforms.uSunColor.value.setRGB(Math.pow(up, 0.3), 0.95 * Math.pow(up, 0.45), 0.9 * Math.pow(up, 0.6));
    this.mat.uniforms.uFogColor.value.copy(sceneFogColor || this.mat.uniforms.uFogColor.value);
    this.mesh.position.x = camWorld.x - origin.x;
    this.mesh.position.z = camWorld.z - origin.z;
    this.mesh.position.y = -origin.y - 0.4;
    this.mat.uniforms.uOrigin.value.set(origin.x, origin.z);
    if (fogNear !== undefined) {
      this.mat.uniforms.uFogNear.value = fogNear;
      this.mat.uniforms.uFogFar.value = fogFar;
    }
  }
}
