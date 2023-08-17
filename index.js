const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  console.log('Unable to initialize WebGL.');
}

// Wierzchołki sześcianu (x, y, z)
const vertices = [
  // Przednia ściana
  -0.5, -0.5, 0.5,
  0.5, -0.5, 0.5,
  0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5,

  // Tylna ściana
  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  0.5, 0.5, -0.5,
  -0.5, 0.5, -0.5,

  // Prawa ściana
  0.5, -0.5, -0.5,
  0.5, 0.5, -0.5,
  0.5, 0.5, 0.5,
  0.5, -0.5, 0.5,

  // Lewa ściana
  -0.5, -0.5, -0.5,
  -0.5, 0.5, -0.5,
  -0.5, 0.5, 0.5,
  -0.5, -0.5, 0.5,

  // Górna ściana
  -0.5, 0.5, -0.5,
  0.5, 0.5, -0.5,
  0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5,

  // Dolna ściana
  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  0.5, -0.5, 0.5,
  -0.5, -0.5, 0.5,
];

const indices = [
  0, 1, 2, 0, 2, 3,   // Przednia ściana
  4, 5, 6, 4, 6, 7,   // Tylna ściana
  8, 9, 10, 8, 10, 11,  // Prawa ściana
  12, 13, 14, 12, 14, 15, // Lewa ściana
  16, 17, 18, 16, 18, 19, // Górna ściana
  20, 21, 22, 20, 22, 23, // Dolna ściana
];
const textureCoordinates = [
  // Dolna ściana
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  // Przednia ściana
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,

  // Prawa ściana
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,

  // Lewa ściana
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  // Tylna ściana
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  // Górna ściana
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,


];

const normals = [
  // Przednia ściana
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,

  // Tylna ściana
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,

  // Prawa ściana
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,

  // Lewa ściana
  -1, 0, 0,
  -1, 0, 0,
  -1, 0, 0,
  -1, 0, 0,

  // Górna ściana
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,

  // Dolna ściana
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
];

// Shadery
const vertexShaderSource = /*glsl*/`
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;  // Nowy atrybut
    varying highp vec2 vTextureCoord;  // Nowa zmienna


    attribute vec3 aVertexNormal;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(void) {

        // Normalna wierzchołka (użyj swoich danych)
        vNormal = mat3(uModelViewMatrix) * aVertexNormal;
        vViewDir = normalize(-(uModelViewMatrix * vec4(aVertexPosition, 1.0)).xyz);
        // Przekazanie normalnej do shadera fragmentów
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
        vTextureCoord = aTextureCoord;  // Przepisywanie współrzędnych tekstur
    }
`;

const fragmentShaderSource = /*glsl*/`

        
      precision mediump float;
      varying vec3 vNormal;
      varying highp vec2 vTextureCoord;  // Współrzędne tekstur
      uniform sampler2D uSampler;  // Tekstura

      void main(void) {

        
        vec3 lightDirection = normalize(vec3(0.0,0.0, 3.5));
        float intensity = dot(vNormal, lightDirection);
        float scale = 0.65;
        vec3 celShadedColor = vec3(intensity) * scale;
        vec4 textureColor = texture2D(uSampler, vTextureCoord);

        gl_FragColor = vec4(celShadedColor * textureColor.rgb, textureColor.a);


      }
`;


function normalize(vec) {
  const len = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
  if (len === 0) {
    return vec;
  }
  return [vec[0] / len, vec[1] / len, vec[2] / len];
}


const texture = gl.createTexture();
const image = new Image();
image.src = 'crate.jpg';  // Ścieżka do obrazu tekstury


const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);


image.onload = function () {
  gl.enable(gl.DEPTH_TEST)
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);  // lub gl.CLAMP_TO_EDGE
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);  // lub gl.CLAMP_TO_EDGE

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


  gl.depthFunc(gl.LEQUAL); // Funkcja testu głębokości

    // Ustawienie przycinania widoku
    gl.viewport(0, 0, canvas.width, canvas.height);


  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
    
  // Po kompilacji shadera
  //const vertexShaderInfoLog = gl.getShaderInfoLog(vertexShader);
  //const fragmentShaderInfoLog = gl.getShaderInfoLog(fragmentShader);
  //console.log("Vertex shader info log:", vertexShaderInfoLog);
  //console.log("Fragment shader info log:", fragmentShaderInfoLog);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(vertexPosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);

  const vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(vertexNormalAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

  
  const uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');
  gl.uniform1i(uSampler, 0);  // Przypisanie tekstury do jednostki 0

  const uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
  const uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');



  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI / 4, canvas.clientWidth / canvas.clientHeight, 0.1, 100.0);

  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);


  const vertexTextureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  gl.enableVertexAttribArray(vertexTextureCoord);
  gl.vertexAttribPointer(vertexTextureCoord, 2, gl.FLOAT, false, 0, 0);





  // W buforze atrybutów tworzymy nowy bufor dla współrzędnych tekstur
  const textureCoordBuffer = gl.createBuffer();







  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  // Animacja
  let angle = 0;
  function animate() {


    

    angle += 0.010;
    const modelViewMatrix = mat4.create();
    mat4.lookAt(modelViewMatrix, [3, 1, 0], [0, 0, 0], [0 , 2 , 0]);
    //mat4.rotateX(modelViewMatrix, modelViewMatrix, 3*Math.cos(angle));
    mat4.rotateY(modelViewMatrix, modelViewMatrix, 3*Math.sin(angle));
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, angle);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    gl.clearColor(0.3, 0.3, 0.3, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(vertexTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(animate);
  }

  animate();
};





