const RED_HEX = "#FF0000";
const RED_RGB = webglUtils.hexToRgb(RED_HEX);
const GREEN_HEX = "#00FF00";
const GREEN_RGB = webglUtils.hexToRgb(GREEN_HEX);
const BLUE_HEX = "#0000ff";
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX);
const RECTANGLE = "RECTANGLE";
const TRIANGLE = "TRIANGLE";
const CIRCLE = "CIRCLE";
const STAR = "STAR";
const origin = { x: 0, y: 0, z: 0 };
var camera = {
  rotation: {x:0, y:0, z:0},
translation: {x:0,y:0,z:0}
};

const sizeOne = { width: 1, height: 1, depth: 1 };
const CUBE = "CUBE";
let shapes = [
  {
    type: RECTANGLE,
    position: origin,
    dimensions: sizeOne,
    color: BLUE_RGB,
    translation: { x: -15, y: 0, z: -20 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 10, y: 10, z: 10 },
  },
  {
    type: TRIANGLE,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation: { x: 15, y: 0, z: -20 },
    rotation: { x: 0, y: 0, z: 180 },
    scale: { x: 10, y: 10, z: 10 },
  },
  /*{
    type: CIRCLE,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation: {x: 100,y: 100, z: -20},
    rotation: {x:0, y:0, z: 0},
    scale: {x: 50, y: 50, z:0}
  },
  {
    type: STAR,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation: {x: 400,y: 100, z:-10},
    rotation: {x:0, y:0, z: 0},
    scale: {x: 50, y: 50, z:0}
  },*/
  {
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: GREEN_RGB,
    translation: { x: -15, y: -15, z: -75 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 45, z: 0 },
  },
];

const addShape = (newShape, type) => {
  const colorHex = document.getElementById("color").value;
  const colorRgb = webglUtils.hexToRgb(colorHex);
  let tx = 0;
  let ty = 0;
  let tz = 0;

  let shape = {
    type: type,
    position: origin,
    dimensions: sizeOne,
    color: colorRgb,
    translation: { x: tx, y: ty, z: tz },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 20, y: 20, z: 20 },
  };
  if (newShape) {
    Object.assign(shape, newShape);
  }
  shapes.push(shape);
  render();
};

let gl;
let attributeCoords;
let uniformMatrix;
let uniformColor;
let bufferCoords;

const doMouseDown = (event) => {
  const boundingRectangle = canvas.getBoundingClientRect();
  const x = Math.round(
    event.clientX - boundingRectangle.left - boundingRectangle.width / 2
  );
  const y = -Math.round(
    event.clientY - boundingRectangle.top - boundingRectangle.height / 2
  );
  const translation = { x, y, z: -150 };
  const rotation = { x: 0, y: 0, z: 180 };
  const shapeType = document.querySelector("input[name='shape']:checked").value;
  const shape = {
    translation,
    rotation,
    type: shapeType,
  };
  addShape(shape, shapeType);
};
let fieldOfViewRadians = m4.degToRad(60);
const up = [0, 1, 0]
let target = [0, 0, 0]
let lookAt = true
const init = () => {
  selectShape(0);
  document.getElementById("fv").value = m4.radToDeg(fieldOfViewRadians);
  document.getElementById("lookAt").onchange = event => webglUtils.toggleLookAt(event);
  document.getElementById("ctx").onchange = event => webglUtils.updateCameraTranslation(event, "x");
  document.getElementById("cty").onchange = event => webglUtils.updateCameraTranslation(event, "y");
  document.getElementById("ctz").onchange = event => webglUtils.updateCameraTranslation(event, "z");
  document.getElementById("crx").onchange = event => webglUtils.updateCameraRotation(event, "x");
  document.getElementById("cry").onchange = event => webglUtils.updateCameraRotation(event, "y");
  document.getElementById("crz").onchange = event => webglUtils.updateCameraRotation(event, "z");
  document.getElementById("ltx").onchange = event => webglUtils.updateLookAtTranslation(event, 0);
  document.getElementById("lty").onchange = event => webglUtils.updateLookAtTranslation(event, 1);
  document.getElementById("ltz").onchange = event => webglUtils.updateLookAtTranslation(event, 2);
   
  document.getElementById("fv").onchange = (event) => updateFieldOfView(event);

  document.getElementById("color").onchange = (event) => updateColor(event);

  const canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl");
  // m4 = canvas.getContext("m4");

  canvas.addEventListener("mousedown", doMouseDown, false);

  const program = webglUtils.createProgramFromScripts(
    gl,
    "#vertex-shader-3d",
    "#fragment-shader-3d"
  );
  gl.useProgram(program);

  // get reference to GLSL attributes and uniforms
  attributeCoords = gl.getAttribLocation(program, "a_coords");
  uniformMatrix = gl.getUniformLocation(program, "u_matrix");
  const uniformResolution = gl.getUniformLocation(program, "u_resolution");
  uniformColor = gl.getUniformLocation(program, "u_color");

  // initialize coordinate attribute
  gl.enableVertexAttribArray(attributeCoords);

  // initialize coordinate buffer
  bufferCoords = gl.createBuffer();

  // configure canvas resolution
  gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};
let selectedShapeIndex = 0;

const updateTranslation = (event, axis) => {
  const value = event.target.value;
  shapes[selectedShapeIndex].translation[axis] = value;
  render();
};

const updateScale = (event, axis) => {
  const value = event.target.value;
  shapes[selectedShapeIndex].scale[axis] = value;
  render();
};

const updateFieldOfView = (event) => {
  fieldOfViewRadians = m4.degToRad(event.target.value);
  render();
};

const updateRotation = (event, axis) => {
  shapes[selectedShapeIndex].rotation[axis] = event.target.value;
  render();
};

const updateColor = (event) => {
  //const value = event.target.value
  const colorHex = document.getElementById("color").value;
  const colorRgb = webglUtils.hexToRgb(colorHex);
  shapes[selectedShapeIndex].color = colorRgb;
  render();
  // TODO: update the color of the shape.
  // Use webglUtils.hexToRgb to convert hex color to rgb
};

const render = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
  gl.vertexAttribPointer(
    attributeCoords,
    3, // size = 3 components per iteration
    gl.FLOAT, // type = gl.FLOAT; i.e., the data is 32bit floats
    false, // normalize = false; i.e., don't normalize the data
    0, // stride = 0; ==> move forward size * sizeof(type)
    // each iteration to get the next position
    0
  ); // offset = 0; i.e., start at the beginning of the buffer
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 1;
  const zFar = 2000;

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
  if(lookAt) {
    let cameraMatrix = m4.identity()
    cameraMatrix = m4.translate(
        cameraMatrix,
        camera.translation.x,
        camera.translation.y,
        camera.translation.z)
    const cameraPosition = [
        cameraMatrix[12],
        cameraMatrix[13],
        cameraMatrix[14]]
    cameraMatrix = m4.lookAt(
        cameraPosition,
        target,
        up)
    cameraMatrix = m4.inverse(cameraMatrix)
    const projectionMatrix = m4.perspective(
        fieldOfViewRadians, aspect, zNear, zFar)
    const viewProjectionMatrix = m4.multiply(
        projectionMatrix, cameraMatrix)
} else {
  cameraMatrix = m4.zRotate(
      cameraMatrix,
      m4.degToRad(camera.rotation.z));
  cameraMatrix = m4.xRotate(
      cameraMatrix,
      m4.degToRad(camera.rotation.x));
  cameraMatrix = m4.yRotate(
      cameraMatrix,
      m4.degToRad(camera.rotation.y));
  cameraMatrix = m4.translate(
      cameraMatrix,
      camera.translation.x,
      camera.translation.y,
      camera.translation.z);
}

    // compute transformation matrix
    const computeModelViewMatrix = (shape, viewProjectionMatrix) => {
      M = m4.translate(viewProjectionMatrix,
         camera.translation.x,
         camera.translation.y,
         camera.translation.z)
       M = m4.xRotate(M, m4.degToRad(shape.rotation.x));
       M = m4.yRotate(M, m4.degToRad(shape.rotation.y));
       M = m4.zRotate(M, m4.degToRad(shape.rotation.z));
       M = m4.scale(M, shape.scale.x, shape.scale.y, shape.scale.z);
       return M;
     };

  const $shapeList = $("#object-list");
  $shapeList.empty();
  shapes.forEach((shape, index) => {
    let M = computeModelViewMatrix(shape, viewProjectionMatrix);
    const $li = $(`
      <li>
      <button onclick="deleteShape(${index})">
      Delete
    </button>
      <label>
       <input
        type="radio"
        id="${shape.type}-${index}"
        name="shape-index"
        ${index === selectedShapeIndex ? "checked" : ""}
        onclick="selectShape(${index})"
        value="${index}"/>
      </label>
          <label>
            ${shape.type};
            X: ${shape.translation.x};
            Y: ${shape.translation.y}
          </label>
        </li>
      `);
    $shapeList.append($li);

  });


  shapes.forEach((shape) => {
    gl.uniform4f(
      uniformColor,
      shape.color.red,
      shape.color.green,
      shape.color.blue,
      1
    );

    gl.uniformMatrix4fv(uniformMatrix, false, M);
    if (shape.type === CUBE) {
      renderCube(shape);
    } else if (shape.type === RECTANGLE) {
      renderRectangle(shape);
    } else if (shape.type === TRIANGLE) {
      renderTriangle(shape);
    }
  });
};
const selectShape = (selectedIndex) => {
  selectedShapeIndex = selectedIndex;
  document.getElementById("tx").value = shapes[selectedIndex].translation.x;
  document.getElementById("ty").value = shapes[selectedIndex].translation.y;
  document.getElementById("tz").value = shapes[selectedIndex].translation.z;
  document.getElementById("sx").value = shapes[selectedIndex].scale.x;
  document.getElementById("sy").value = shapes[selectedIndex].scale.y;
  document.getElementById("sz").value = shapes[selectedIndex].scale.z;
  document.getElementById("rx").value = shapes[selectedIndex].rotation.x;
  document.getElementById("ry").value = shapes[selectedIndex].rotation.y;
  document.getElementById("rz").value = shapes[selectedIndex].rotation.z;
  document.getElementById("fv").value = m4.radToDeg(fieldOfViewRadians);
  const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color);
  document.getElementById("color").value = hexColor;
};

const renderTriangle = (triangle) => {
  const x1 = triangle.position.x - triangle.dimensions.width / 2;
  const y1 = triangle.position.y + triangle.dimensions.height / 2;
  const x2 = triangle.position.x + triangle.dimensions.width / 2;
  const y2 = triangle.position.y + triangle.dimensions.height / 2;
  const x3 = triangle.position.x;
  const y3 = triangle.position.y - triangle.dimensions.height / 2;

  const float32Array = new Float32Array([x1, y1, 0, x3, y3, 0, x2, y2, 0]);

  gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
};

const renderCube = (cube) => {
  const geometry = [
    0,
    0,
    0,
    0,
    30,
    0,
    30,
    0,
    0,
    0,
    30,
    0,
    30,
    30,
    0,
    30,
    0,
    0,
    0,
    0,
    30,
    30,
    0,
    30,
    0,
    30,
    30,
    0,
    30,
    30,
    30,
    0,
    30,
    30,
    30,
    30,
    0,
    30,
    0,
    0,
    30,
    30,
    30,
    30,
    30,
    0,
    30,
    0,
    30,
    30,
    30,
    30,
    30,
    0,
    0,
    0,
    0,
    30,
    0,
    0,
    30,
    0,
    30,
    0,
    0,
    0,
    30,
    0,
    30,
    0,
    0,
    30,
    0,
    0,
    0,
    0,
    0,
    30,
    0,
    30,
    30,
    0,
    0,
    0,
    0,
    30,
    30,
    0,
    30,
    0,
    30,
    0,
    30,
    30,
    0,
    0,
    30,
    30,
    30,
    30,
    30,
    30,
    30,
    0,
    0,
    30,
    30,
    0,
  ];
  const float32Array = new Float32Array(geometry);
  gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);
  var primitiveType = gl.TRIANGLES;
  gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
};
const deleteShape = (shapeIndex) => {
  shapes.splice(shapeIndex, 1);
  render();
};
const renderRectangle = (rectangle) => {
  const x1 = rectangle.position.x - rectangle.dimensions.width / 2;
  const y1 = rectangle.position.y - rectangle.dimensions.height / 2;
  const x2 = rectangle.position.x + rectangle.dimensions.width / 2;
  const y2 = rectangle.position.y + rectangle.dimensions.height / 2;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      x1,
      y1,
      0,
      x2,
      y1,
      0,
      x1,
      y2,
      0,
      x1,
      y2,
      0,
      x2,
      y1,
      0,
      x2,
      y2,
      0,
    ]),
    gl.STATIC_DRAW
  );

  gl.drawArrays(gl.TRIANGLES, 0, 6);
};
/*const renderCircle = (circle) => {
    const x0 = circle.position.x;
    const y0 = circle.position.y;
    const x1 = circle.position.x
      - circle.dimensions.width/2;
    const y1 = circle.position.y
      - circle.dimensions.height/2;
    const x2 = circle.position.x
      + circle.dimensions.width/2;
    const y2 = circle.position.y
      + circle.dimensions.height/2;
    const x3 = circle.position.x// 30 degrees off of vertical
    - circle.dimensions.width/4;
    const x4 = circle.position.x// 60 degrees off of vertical
    - Math.sqrt(3)*circle.dimensions.width/4;
    const y3 = circle.position.y
    - circle.dimensions.height/4;// 30 degrees off of horizontal
    const y4 = circle.position.y
    - Math.sqrt(3)*circle.dimensions.height/4;// 60 degrees off of horizontal  
    const x5 = circle.position.x// 30 degrees off of vertical
    + circle.dimensions.width/4;
    const x6 = circle.position.x// 60 degrees off of vertical
    + Math.sqrt(3)*circle.dimensions.width/4;
    const y5 = circle.position.y
    + circle.dimensions.height/4;// 30 degrees off of horizontal
    const y6 = circle.position.y
    + Math.sqrt(3)*circle.dimensions.height/4;// 60 degrees off of horizontal  

  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x0, y0, 0, x3, y4, 0, x0, y1, 0,
      x0, y0, 0, x3,y4, 0, x4, y3, 0,
      x0, y0, 0, x4,y3, 0, x1, y0, 0,
      x0, y0, 0, x1, y0, 0, x4,y5, 0,
      x0, y0, 0, x4, y5, 0, x3, y6, 0,
      x0, y0, 0, x3, y6, 0, x0, y2, 0,
      x0, y0, 0, x0, y2, 0, x5, y6, 0,
      x0, y0, 0, x5, y6, 0, x6, y5, 0,
      x0, y0, 0, x6, y5, 0, x2, y0, 0,
      x0, y0, 0, x2, y0, 0, x6, y3, 0,
      x0, y0, 0, x6, y3, 0, x5, y4, 0,
      x0, y0, 0, x5, y4, 0, x0, y1, 0,

    ]), gl.STATIC_DRAW);
  
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
  const renderStar = (star) => {
    const x0 = star.position.x;
    const y0 = star.position.y;
    const x1 = star.position.x
      - Math.sqrt(3)*star.dimensions.width/4;
    const y1 = star.position.y
      - star.dimensions.height/2;
    const x2 = star.position.x
      + Math.sqrt(3)*star.dimensions.width/4;
    const y2 = star.position.y
      + star.dimensions.height/2;
      const y3 = star.position.y
      - star.dimensions.height/4;
      const y4 = star.position.y
      + star.dimensions.height/4;
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y4, 0, x0, y1, 0, x2, y4, 0,
      x1, y3, 0, x0, y2, 0, x2, y3, 0,
    ]), gl.STATIC_DRAW);
  
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }*/
