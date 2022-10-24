<template>
  <canvas ref="experience" />
</template>
<script setup lang="ts">
import * as THREE from "three";
import { onMounted, ref, computed, watch } from "vue";
import { useWindowSize, useMouse } from "@vueuse/core";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { sRGBEncoding } from "three";
import modelTexture from "~/assets/testModel.jpeg";
import model from "../assets/testModel.glb";
import vertexShader from "../assets/shaders/vertexShader.glsl.js";
import fragmentShader from "../assets/shaders/fragmentShader.glsl.js";

let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let mainModel: THREE.Group;
let delta: number = 0;
const loader = new GLTFLoader();
const rayCaster = new THREE.Raycaster();

const experience = ref<HTMLCanvasElement | null>(null);
const scene = new THREE.Scene();

const { width, height } = useWindowSize();
const { x, y } = useMouse();

const aspectRatio = computed(() => width.value / height.value);

function updateRenderer() {
  renderer.setSize(width.value, height.value);
  renderer.setPixelRatio(window.devicePixelRatio);
}
function updateCamera() {
  camera.aspect = aspectRatio.value;
  camera.updateProjectionMatrix();
}

watch(aspectRatio, updateRenderer);
watch(aspectRatio, updateCamera);

camera = new THREE.PerspectiveCamera(75, aspectRatio.value, 0.1, 1000);
camera.position.set(0, 5, 15);

scene.add(camera);

const mainMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: {
      value: delta,
    },
    uResolution: {
      value: new THREE.Vector2(width.value, height.value),
    },
    cubePos: {
      value: [x.value, y.value],
    },
    uTexture: {
      value: undefined,
    },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
});

loader.load(
  model,
  (gltf) => {
    console.log("here");
    console.log(gltf.scene);
    console.log(scene);
    console.log("there");
    console.log(gltf.scene.children[0]);
    gltf.scene.scale.set(0.02, 0.02, 0.02);
    gltf.scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = mainMaterial;
        mainMaterial.uniforms.uTexture.value = new THREE.TextureLoader().load(modelTexture)
      }
    });

    mainModel = gltf.scene;
    // called when the resource is loaded
    scene.add(mainModel);
  },
  (xhr) => {
    // called while loading is progressing
    console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  (error) => {
    // called when loading has errors
    console.error("An error happened", error);
  }
);

const Box = new THREE.Mesh(
  new THREE.BoxGeometry(1,1,1,1,1,1),
  new THREE.MeshBasicMaterial({
    color: "green",
    wireframe: true
  }),
)

scene.add(Box)

const light = new THREE.DirectionalLight(0xffffff, 15);
light.position.set(1000, 1000, 1000);
light.lookAt(0, 0, 0);
scene.add(light);

const hemiSphere = new THREE.HemisphereLight("white", "darkslategrey", 5);
scene.add(hemiSphere);

const loop = () => {
  delta += 0.01;

  
  const pointer = {
    x: (x.value / width.value) * 2 - 1,
    y: -(y.value / height.value) * 2 + 1,
  };
  if (mainModel !== undefined) {
    rayCaster.setFromCamera(pointer, camera);
    const intersects = rayCaster.intersectObjects(scene.children);
    for (let i = 0; i < intersects.length; i++) {
      const point = intersects[i].point;
      // console.log(point);
      Box.position.set(point.x,point.y,point.z);
      Box.scale.set(
      Math.abs(Math.sin(delta))+2,
      Math.abs(Math.sin(delta))+2,
      Math.abs(Math.sin(delta))+2
      )
      mainMaterial.uniforms.cubePos.value = [point.x, point.z];
      mainMaterial.uniforms.uTime.value = delta;
    }
    mainModel.rotation.y += 0.01;
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
};

onMounted(() => {
  renderer = new THREE.WebGLRenderer({
    canvas: experience.value as unknown as HTMLCanvasElement,
    antialias: true,
  });
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.outputEncoding = sRGBEncoding;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.5;
  updateRenderer();
  updateCamera();

  console.log(scene);

  loop();
});
</script>
<style>
* {
  margin: 0;
  padding: 0;
}
</style>
