const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const GREEN_HEX = "#00FF00"
const GREEN_RGB = webglUtils.hexToRgb(GREEN_HEX)
const BLUE_HEX = "#0000ff"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const CIRCLE = "CIRCLE"
const STAR = "STAR"

const origin = {x: 0, y: 0}
const sizeOne = {width: 1, height: 1}
let shapes = [
  {
    type: RECTANGLE,
    position: origin,
    dimensions: sizeOne,
    color: BLUE_RGB,
    translation: {x: 200, y: 100},
    rotation: {z: 0},
    scale: {x: 50, y: 50}
  },
  {
    type: TRIANGLE,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation: {x: 300,y: 100},
    rotation: {z: 0},
    scale: {x: 50, y: 50}
  },
  {
    type: CIRCLE,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation: {x: 100,y: 100},
    rotation: {z: 0},
    scale: {x: 50, y: 50}
  },
  {
    type: STAR,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation: {x: 400,y: 100},
    rotation: {z: 0},
    scale: {x: 50, y: 50}
  }
]

const addShape = (translation, type) => {
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    let tx = 0
    let ty = 0
    if (translation) {
      tx = translation.x
      ty = translation.y
    }
    const shape = {
      type: type,
      position: origin,
      dimensions: sizeOne,
      color: colorRgb,
      translation: {x: tx, y: ty, z: 0},
      rotation: {x: 0, y: 0, z: 0},
      scale: {x: 50, y: 50, z: 50}
    }
    shapes.push(shape)
    render()
   }   

let gl
let attributeCoords
let uniformMatrix
let uniformColor
let bufferCoords

const doMouseDown = (event) => {
  const boundingRectangle = canvas.getBoundingClientRect();
  const x = event.clientX - boundingRectangle.left;
  const y = event.clientY - boundingRectangle.top;
  const translation = {x, y}
  const shape = document.querySelector("input[name='shape']:checked").value
 
  addShape(translation, shape)
}

const init = () => {
  selectShape(0)
    document.getElementById("tx").onchange = event => updateTranslation(event, "x")
    document.getElementById("ty").onchange = event => updateTranslation(event, "y")
   
     document.getElementById("sx").onchange = event => updateScale(event, "x")
     document.getElementById("sy").onchange = event => updateScale(event, "y")
   
     document.getElementById("rz").onchange = event => updateRotation(event, "z")
   
     document.getElementById("color").onchange = event => updateColor(event, "color")
  const canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl");

 canvas.addEventListener(
    "mousedown",
    doMouseDown,
    false);

  const program = webglUtils.createProgramFromScripts(gl, "#vertex-shader-2d", "#fragment-shader-2d");
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
  gl.clear(gl.COLOR_BUFFER_BIT);
}
let selectedShapeIndex = 0

const updateTranslation = (event, axis) => {
 const value = event.target.value
 shapes[selectedShapeIndex].translation[axis] = value
 render()
}

const updateScale = (event, axis) => {
    const value = event.target.value
    shapes[selectedShapeIndex].scale[axis] = value
    render()
}

const updateRotation = (event, axis) => {
  const value = event.target.value
  const angleInDegrees = (360 - value) * Math.PI / 180;
  shapes[selectedShapeIndex].rotation[axis] = angleInDegrees
  render();
}

const updateColor = (event) => {
      //const value = event.target.value
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    shapes[selectedShapeIndex].color = colorRgb
    render();
 // TODO: update the color of the shape.
 // Use webglUtils.hexToRgb to convert hex color to rgb
}


const render = () => {


  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
  gl.vertexAttribPointer(
    attributeCoords,
    2,           // size = 2 components per iteration
    gl.FLOAT,    // type = gl.FLOAT; i.e., the data is 32bit floats
    false,       // normalize = false; i.e., don't normalize the data
    0,           // stride = 0; ==> move forward size * sizeof(type)
    // each iteration to get the next position
    0);          // offset = 0; i.e., start at the beginning of the buffer
    
    const $shapeList = $("#object-list")
    $shapeList.empty()
    shapes.forEach((shape, index) => {
   
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
        ${index === selectedShapeIndex ? "checked": ""}
        onclick="selectShape(${index})"
        value="${index}"/>
      </label>
          <label>
            ${shape.type};
            X: ${shape.translation.x};
            Y: ${shape.translation.y}
          </label>
        </li>
      `)
      $shapeList.append($li)
    })

  shapes.forEach(shape => {
    gl.uniform4f(uniformColor,
      shape.color.red,
      shape.color.green,
      shape.color.blue, 1);

    // compute transformation matrix
      let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
      matrix = m3.translate(matrix, shape.translation.x, shape.translation.y);
      matrix = m3.rotate(matrix, shape.rotation.z);
      matrix = m3.scale(matrix, shape.scale.x, shape.scale.y);
  
      // apply transformation matrix.
      gl.uniformMatrix3fv(uniformMatrix, false, matrix);

    if(shape.type === RECTANGLE) {
      renderRectangle(shape)
    } else if(shape.type === TRIANGLE) {
      renderTriangle(shape)
    }
    else if(shape.type === CIRCLE) {
        renderCircle(shape)
      } else if(shape.type === STAR) {
        renderStar(shape)
      }

      
  })
}
const selectShape = (selectedIndex) => {
  selectedShapeIndex = selectedIndex
  document.getElementById("tx").value = shapes[selectedIndex].translation.x
  document.getElementById("ty").value = shapes[selectedIndex].translation.y
  // TODO: update the scale and rotation fields
  const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
  document.getElementById("color").value = hexColor
}

const renderTriangle = (triangle) => {
  const x1 = triangle.position.x
    - triangle.dimensions.width / 2
  const y1 = triangle.position.y
    + triangle.dimensions.height / 2
  const x2 = triangle.position.x
    + triangle.dimensions.width / 2
  const y2 = triangle.position.y
    + triangle.dimensions.height / 2
  const x3 = triangle.position.x
  const y3 = triangle.position.y
    - triangle.dimensions.height / 2

  const float32Array = new Float32Array([
    x1, y1,   x2, y2,   x3, y3
  ])

  gl.bufferData(gl.ARRAY_BUFFER,
    float32Array, gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const deleteShape = (shapeIndex) => {
    shapes.splice(shapeIndex, 1)
    render()
   }

const renderRectangle = (rectangle) => {
  const x1 = rectangle.position.x
    - rectangle.dimensions.width/2;
  const y1 = rectangle.position.y
    - rectangle.dimensions.height/2;
  const x2 = rectangle.position.x
    + rectangle.dimensions.width/2;
  const y2 = rectangle.position.y
    + rectangle.dimensions.height/2;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1, x2, y1, x1, y2,
    x1, y2, x2, y1, x2, y2,
  ]), gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
const renderCircle = (circle) => {
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
      x0, y0, x3, y4, x0, y1,
      x0, y0, x3,y4, x4, y3,
      x0, y0, x4,y3, x1, y0,
      x0, y0, x1, y0, x4,y5,
      x0, y0, x4, y5, x3, y6,
      x0, y0, x3, y6, x0, y2,
      x0, y0, x0, y2, x5, y6, 
      x0, y0, x5, y6, x6, y5,
      x0, y0, x6, y5, x2, y0, 
      x0, y0, x2, y0, x6, y3,
      x0, y0, x6, y3, x5, y4,
      x0, y0, x5, y4, x0, y1,

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
      x1, y4, x0, y1, x2, y4,
      x1, y3, x0, y2, x2, y3,
    ]), gl.STATIC_DRAW);
  
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }