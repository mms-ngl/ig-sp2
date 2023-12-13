"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;
var nMatrix;

var modelViewMatrixLoc;
var normalMatrixLoc;


// VIEW POSITION 
var radius = 0.05;
var theta_view = -40*Math.PI/180.0;
var phi = -30*Math.PI/180.0;

// CAMERA POSITION
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


var lightPosition = vec4(0.0, 2.0, 0.0, 1.0 );

var lightDiffuse = vec4(0.2, 0.2, 0.2, 1.0);
var materialDiffuse = vec4(0.7, 0.7, 0.7, 1.0);

var positionsArray = [];
var texCoordsArray = [];
var tangentsArray = [];
var normalsArray = [];


var animate = false;



/*--------------------------------HIERARCHICAL MODELLING--------------------------------*/

// CAT MODEL IDS
var torsoId = 0;
var headId  = 1;

var leftUpperFrontLegId = 2;
var leftLowerFrontLegId = 3;
var rightUpperFrontLegId = 4;
var rightLowerFrontLegId = 5;
var leftUpperBackLegId = 6;
var leftLowerBackLegId = 7;
var rightUpperBackLegId = 8;
var rightLowerBackLegId = 9;

var tail1Id = 10;
var tail2Id = 11;
var tail3Id = 12;

var carpetId = 13;

var tableSurfaceId = 14;
var tableLeg1Id = 15;
var tableLeg2Id = 16;
var tableLeg3Id = 17;
var tableLeg4Id = 18;


// CAT MODEL HEIGHTS NAD WIDTHS
var torsoHeight = 0.75;
var torsoWidth = 2.0;

var upperLegHeight = 0.45;
var upperLegWidth  = 0.20;

var lowerLegHeight = 0.35;
var lowerLegWidth  = 0.10;

var headHeight = 0.4;
var headWidth = 0.4;

var tail1Height = 0.6;
var tail1Width = 0.2;
var tail2Height = 0.5;
var tail2Width = 0.15;
var tail3Height = 0.75;
var tail3Width = 0.1;

var carpetHeight = 0.1;
var carpetWidth = 18;

var tableSurfaceHeight = 0.3;
var tableSurfaceWidth = 4;
var tableLegHeight = 1.0;
var tableLegWidth = 0.20;


var figure = [];
var surface = [];
var table = [];

var numNodes = 19;

function createNode(transform, render, sibling, child){
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}

var theta = [0, 270, 180, 0, 180, 0, 180, 0, 180, 0, 70, -50, -60, 0, 0, 0, 0, 0, 0];

var torsoTranslate = [0.0, (carpetHeight+upperLegHeight+lowerLegHeight), -(0.5*carpetWidth-0.5*torsoWidth)];

function initNodes(Id) {

    var m = mat4();

    switch(Id) {

        // CAT FIGURE MODEL
        case torsoId:
            m = translate(torsoTranslate[0], torsoTranslate[1], torsoTranslate[2]);
            m = mult(m, rotate(theta[torsoId], vec3(1, 0, 0)));
            figure[torsoId] = createNode(m, torso, null, headId);
            break;

        case headId:
            m = translate(0.0, 1.8*headHeight, (0.5*torsoWidth));
            m = mult(m, rotate(theta[headId], vec3(1, 0, 0)));
            m = mult(m, rotate(theta[headId], vec3(0, 1, 0)));
            figure[headId] = createNode(m, head, leftUpperFrontLegId, null);
            break;

        case leftUpperFrontLegId:
            m = translate((0.5*torsoHeight), 0.0, (0.5*torsoWidth-0.5*upperLegWidth))
            m = mult(m, rotate(theta[leftUpperFrontLegId], vec3(1, 0, 0)));
            figure[leftUpperFrontLegId] = createNode(m, leftUpperFrontLeg, rightUpperFrontLegId, leftLowerFrontLegId);
            break;

        case rightUpperFrontLegId:
            m = translate(-(0.5*torsoHeight), 0.0, (0.5*torsoWidth-0.5*upperLegWidth))
        	m = mult(m, rotate(theta[rightUpperFrontLegId], vec3(1, 0, 0)));
            figure[rightUpperFrontLegId] = createNode(m, rightUpperFrontLeg, rightUpperBackLegId, rightLowerFrontLegId);
            break;

        case rightUpperBackLegId:
            m = translate(-(0.5*torsoHeight), 0.0, -(0.5*torsoWidth-0.5*upperLegWidth))
            m = mult(m, rotate(theta[rightUpperBackLegId], vec3(1, 0, 0)));
            figure[rightUpperBackLegId] = createNode(m, rightUpperLeg, leftUpperBackLegId, rightLowerBackLegId);
            break;

        case leftUpperBackLegId:
            m = translate((0.5*torsoHeight), 0.0, -(0.5*torsoWidth-0.5*upperLegWidth))
        	m = mult(m , rotate(theta[leftUpperBackLegId], vec3(1, 0, 0)));
            figure[leftUpperBackLegId] = createNode(m, leftUpperLeg, tail1Id, leftLowerBackLegId);
            break;

        case tail1Id:
            m = translate(0.0, 0.5*torsoHeight+0.5*tail1Height, -(0.5*torsoWidth));
            m = mult(m, rotate(theta[tail1Id], vec3(1, 0, 0)));
            figure[tail1Id] = createNode(m, tail1, null, tail2Id);
            break;

        case tail2Id:
            m = translate(0.0, tail1Height, 0.0);
            m = mult(m, rotate(theta[tail2Id], vec3(1, 0, 0)));
            figure[tail2Id] = createNode(m, tail2, null, tail3Id);
            break;

        case tail3Id:
            m = translate(0.0, tail2Height, 0.0);
            m = mult(m, rotate(theta[tail3Id], vec3(1, 0, 0)));
            figure[tail3Id] = createNode(m, tail3, null, null);
            break;

        case leftLowerFrontLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerFrontLegId], vec3(1, 0, 0)));
            figure[leftLowerFrontLegId] = createNode(m, leftLowerFrontLeg, null, null);
            break;

        case rightLowerFrontLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerFrontLegId], vec3(1, 0, 0)));
            figure[rightLowerFrontLegId] = createNode(m, rightLowerFrontLeg, null, null);
            break;

        case leftLowerBackLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerBackLegId],vec3(1, 0, 0)));
            figure[leftLowerBackLegId] = createNode(m, leftLowerLeg, null, null);
            break;

        case rightLowerBackLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerBackLegId], vec3(1, 0, 0)));
            figure[rightLowerBackLegId] = createNode(m, rightLowerLeg, null, null);
            break;

        // CARPET MODEL
        case carpetId:
            m = translate(0.0, 0.0, 0.0);
            m = mult(m, rotate(theta[carpetId], vec3(1, 0, 0)));
            surface[carpetId] = createNode(m, carpet, null, null);
            break;

        // TABLE MODEL
        case tableSurfaceId:
            m = translate(0.0, carpetHeight+tableLegHeight, 0.0);
            m = mult(m, rotate(theta[tableSurfaceId], vec3(1, 0, 0)));
            table[tableSurfaceId] = createNode(m, tableSurface, null, tableLeg1Id);
            break;

        case tableLeg1Id:
            m = translate(-(0.5*tableSurfaceWidth-0.5*tableLegWidth), -tableLegHeight, -(0.5*tableSurfaceWidth-0.5*tableLegWidth));
            m = mult(m, rotate(theta[tableLeg1Id], vec3(1, 0, 0)));
            table[tableLeg1Id] = createNode(m, tableLeg1, tableLeg2Id, null);
            break;

        case tableLeg2Id:
            m = translate(-(0.5*tableSurfaceWidth-0.5*tableLegWidth), -tableLegHeight, (0.5*tableSurfaceWidth-0.5*tableLegWidth));
            m = mult(m, rotate(theta[tableLeg2Id], vec3(1, 0, 0)));
            table[tableLeg2Id] = createNode(m, tableLeg2, tableLeg3Id, null);
            break;

        case tableLeg3Id:
            m = translate((0.5*tableSurfaceWidth-0.5*tableLegWidth), -tableLegHeight, -(0.5*tableSurfaceWidth-0.5*tableLegWidth));
            m = mult(m, rotate(theta[tableLeg3Id], vec3(1, 0, 0)));
            table[tableLeg3Id] = createNode(m, tableLeg3, tableLeg4Id, null);
            break;

        case tableLeg4Id:
            m = translate((0.5*tableSurfaceWidth-0.5*tableLegWidth), -tableLegHeight, (0.5*tableSurfaceWidth-0.5*tableLegWidth));
            m = mult(m, rotate(theta[tableLeg4Id], vec3(1, 0, 0)));
            table[tableLeg4Id] = createNode(m, tableLeg4, null, null);
            break;    
    }
}


function torso() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(torsoWidth/2, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), false);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    

    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    for(var i=0; i<3; i++){
        gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    }

    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), true);
    gl.drawArrays(gl.TRIANGLE_FAN, 4*3, 4);

    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    for(var i=4; i<6; i++){
        gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    }
}

function leftUpperFrontLeg() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerFrontLeg() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperFrontLeg() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerFrontLeg() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperLeg() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail1() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tail1Height, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(tail1Width, tail1Height, tail1Width));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail2() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tail2Height, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(tail2Width, tail2Height, tail2Width));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail3() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tail3Height, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(tail3Width, tail3Height, tail3Width));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function carpet() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * carpetHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(carpetWidth, carpetHeight, carpetWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    var nMatrix = normalMatrix(instanceMatrix, true);
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tableSurface() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tableSurfaceHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(tableSurfaceWidth, tableSurfaceHeight, tableSurfaceWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tableLeg1() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tableLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(tableLegWidth, tableLegHeight, tableLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tableLeg2() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tableLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(tableLegWidth, tableLegHeight, tableLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tableLeg3() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tableLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(tableLegWidth, tableLegHeight, tableLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tableLeg4() {
    gl.uniform1f(gl.getUniformLocation(program, "textureCarpet"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureTable"), true);
    gl.uniform1f(gl.getUniformLocation(program, "textureBody"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHead"), false);
    gl.uniform1f(gl.getUniformLocation(program, "textureHeadFront"), false);
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tableLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(tableLegWidth, tableLegHeight, tableLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}


var stack = [];

function traverse(model, Id) {

    if(Id == null) return;
    stack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, model[Id].transform);
    model[Id].render();
    if(model[Id].child != null) traverse(model, model[Id].child);
    modelViewMatrix = stack.pop();
    if(model[Id].sibling != null) traverse(model, model[Id].sibling);
}



/*--------------------------------TEXTURE CONSTRUCTIONS--------------------------------*/

var carpetImage;
var tableImage
var bodyImage;
var faceImage;

var texSize = 256;
var bumpImage;

function bump_texture() {
    // Bump Data
    var data = new Array()
    for (var i = 0; i<= texSize; i++)  
        data[i] = new Array();

    for (var i = 0; i<= texSize; i++) 
        for (var j=0; j<=texSize; j++)
            data[i][j] = Math.random()*100;

    // Bump Map Normals
    var normalst = new Array()
    for (var i=0; i<texSize; i++)  
        normalst[i] = new Array();

    for (var i=0; i<texSize; i++) 
        for (var j = 0; j<texSize; j++)
            normalst[i][j] = new Array();

    for (var i=0; i<texSize; i++) 
        for (var j=0; j<texSize; j++) {
            normalst[i][j][0] = data[i][j]-data[i+1][j];
            normalst[i][j][1] = data[i][j]-data[i][j+1];
            normalst[i][j][2] = 1;
        }

    // Scale to Texture Coordinates
    for (var i=0; i<texSize; i++) {
        for (var j=0; j<texSize; j++) {
            var d = 0;
            
            for(k=0; k<3; k++) 
                d+=normalst[i][j][k]*normalst[i][j][k];
            
            d = Math.sqrt(d);
            
            for(k=0;k<3;k++) 
                normalst[i][j][k]= 0.5*normalst[i][j][k]/d + 0.5;
        }
    }

    // Normal Texture Array
    var normals = new Uint8Array(3*texSize*texSize);
        for (var i = 0; i < texSize; i++)
            for (var j = 0; j < texSize; j++)
            for(var k =0; k<3; k++)
                    normals[3*texSize*i+3*j+k] = 255*normalst[i][j][k];
    
    return normals;
}

var carpetTexture;
var tableTexture;
var bodyTexture;
var faceTexture;
var bumpTexture;

function configureTexture(carpetImage, tableImage, bodyImage, faceImage, bumpImage) {
    carpetTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, carpetTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, carpetImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  
    gl.uniform1i(gl.getUniformLocation(program, "uTexture_carpet"), 0);  

    tableTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tableTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, tableImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  
    gl.uniform1i(gl.getUniformLocation(program, "uTexture_table"), 1);  

    bodyTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, bodyTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bodyImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  
    gl.uniform1i(gl.getUniformLocation(program, "uTexture_body"), 2);  

    faceTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, faceTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, faceImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  
    gl.uniform1i(gl.getUniformLocation(program, "uTexture_face"), 3);  

    bumpTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, bumpTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, bumpImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 4);

}



/*--------------------------------CUBE AND ARRAYS--------------------------------*/

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);
    
    t1 = vec3(Math.abs(t1[0]), Math.abs(t1[1]), Math.abs(t1[2]));

    positionsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);
    normalsArray.push(normal);
    tangentsArray.push(t1);

    positionsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1]);
    normalsArray.push(normal);
    tangentsArray.push(t1);

    positionsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);
    normalsArray.push(normal);
    tangentsArray.push(t1);

    positionsArray.push(vertices[d]);
    texCoordsArray.push(texCoord[3]);
    normalsArray.push(normal);
    tangentsArray.push(t1);
}

function cube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}



/*--------------------------------INIT--------------------------------*/

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    program = initShaders( gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);

    cube();

    instanceMatrix = mat4();
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    // NORMALS
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    // TANGENTS
    var tangBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tangBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tangentsArray), gl.STATIC_DRAW);
    var tangentsLoc = gl.getAttribLocation(program, "aTangent");
    gl.vertexAttribPointer(tangentsLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(tangentsLoc);

    // POSITIONS
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    var positionLoc =gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // TEXTURES
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);


    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct);

    document.getElementById("animation").onclick = function(event) {
        animate = true;
    };

    document.getElementById("radiusSlider").onchange = function(event) {
        radius = event.target.value;
    };
  
    document.getElementById("thetaSlider").onchange = function(event) {
        theta_view = event.target.value*Math.PI/180.0;
    };
     
    document.getElementById("phiSlider").onchange = function(event) {
        phi = event.target.value*Math.PI/180.0;
    };


    carpetImage = document.getElementById("carpet");
    tableImage = document.getElementById("table");
    bodyImage = document.getElementById("fur");
    faceImage = document.getElementById("face");
    bumpImage = bump_texture();

    configureTexture(carpetImage, tableImage, bodyImage, faceImage, bumpImage);
    

    for(var i=0; i<numNodes; i++) initNodes(i);

    render();
}



/*--------------------------------ANIMATION--------------------------------*/

var x = 0;
var y = 1;
var z = 2;
var initTheta = theta.slice();

function walk(step) {

    torsoTranslate[z] += 0.2;

    if (step == 1) {

        theta[leftUpperFrontLegId] = initTheta[leftUpperFrontLegId] + 20;
        theta[leftLowerFrontLegId] = initTheta[leftLowerFrontLegId];

        theta[rightUpperFrontLegId] = initTheta[rightUpperFrontLegId] - 20;
        theta[rightLowerFrontLegId] = initTheta[rightLowerFrontLegId] - 20;


        theta[leftUpperBackLegId] = initTheta[leftUpperBackLegId] + 20;
        theta[leftLowerBackLegId] = initTheta[leftLowerBackLegId];

        theta[rightUpperBackLegId] = initTheta[rightUpperBackLegId] - 20;
        theta[rightLowerBackLegId] = initTheta[rightLowerBackLegId] - 20;

        step++;
    }
    else if (step == 2) {

        theta[leftUpperFrontLegId] = initTheta[leftUpperFrontLegId];
        theta[leftLowerFrontLegId] = initTheta[leftLowerFrontLegId];

        theta[rightUpperFrontLegId] = initTheta[rightUpperFrontLegId];
        theta[rightLowerFrontLegId] = initTheta[rightLowerFrontLegId];


        theta[leftUpperBackLegId] = initTheta[leftUpperBackLegId];
        theta[leftLowerBackLegId] = initTheta[leftLowerBackLegId];

        theta[rightUpperBackLegId] = initTheta[rightUpperBackLegId];
        theta[rightLowerBackLegId] = initTheta[rightLowerBackLegId];

        step++;
    }
    else if (step == 3) {

        theta[leftUpperFrontLegId] = initTheta[leftUpperFrontLegId] - 20;
        theta[leftLowerFrontLegId] = initTheta[leftLowerFrontLegId] - 20;

        theta[rightUpperFrontLegId] = initTheta[rightUpperFrontLegId] + 20;
        theta[rightLowerFrontLegId] = initTheta[rightLowerFrontLegId];


        theta[leftUpperBackLegId] = initTheta[leftUpperBackLegId] - 20;
        theta[leftLowerBackLegId] = initTheta[leftLowerBackLegId] - 20;

        theta[rightUpperBackLegId] = initTheta[rightUpperBackLegId] + 20;
        theta[rightLowerBackLegId] = initTheta[rightLowerBackLegId];

        step = 1;
    }

    initNodes(torsoId);

    initNodes(leftUpperFrontLegId);
    initNodes(leftLowerFrontLegId);

    initNodes(rightUpperFrontLegId);
    initNodes(rightLowerFrontLegId);

    initNodes(leftUpperBackLegId);
    initNodes(leftLowerBackLegId);

    initNodes(rightUpperBackLegId);
    initNodes(rightLowerBackLegId);

    return step;
}

function jump(step) {

    torsoTranslate[z] += 0.55;

    if (step == 1) {
        torsoTranslate[y] = torsoTranslate[y] + 0.5;
    }
    else if (step == 2) {
        torsoTranslate[y] = torsoTranslate[y] + 1.0;
    }
    else if (step == 3) {
        torsoTranslate[y] = torsoTranslate[y] + 1.5;
    }
    else if (step == 4) {
        torsoTranslate[y] = torsoTranslate[y] - 0.5;
    }
    else if (step == 5) {
        torsoTranslate[y] = torsoTranslate[y] - 0.75;
    }
    else if (step == 6) {
        torsoTranslate[y] = torsoTranslate[y] - 0.45;
    }

    if (step > 0 && step < 5) {

        theta[leftUpperFrontLegId] = initTheta[leftUpperFrontLegId] - 15;
        theta[leftLowerFrontLegId] = initTheta[leftLowerFrontLegId];

        theta[rightUpperFrontLegId] = initTheta[rightUpperFrontLegId] - 15;
        theta[rightLowerFrontLegId] = initTheta[rightLowerFrontLegId];


        theta[leftUpperBackLegId] = initTheta[leftUpperBackLegId] - 15;
        theta[leftLowerBackLegId] = initTheta[leftLowerBackLegId];

        theta[rightUpperBackLegId] = initTheta[rightUpperBackLegId] -15;
        theta[rightLowerBackLegId] = initTheta[rightLowerBackLegId]; 
    }
    else {

        theta[leftUpperFrontLegId] = initTheta[leftUpperFrontLegId];
        theta[leftLowerFrontLegId] = initTheta[leftLowerFrontLegId];

        theta[rightUpperFrontLegId] = initTheta[rightUpperFrontLegId];
        theta[rightLowerFrontLegId] = initTheta[rightLowerFrontLegId];


        theta[leftUpperBackLegId] = initTheta[leftUpperBackLegId];
        theta[leftLowerBackLegId] = initTheta[leftLowerBackLegId];

        theta[rightUpperBackLegId] = initTheta[rightUpperBackLegId];
        theta[rightLowerBackLegId] = initTheta[rightLowerBackLegId];
    }

    initNodes(torsoId);

    initNodes(leftUpperFrontLegId);
    initNodes(leftLowerFrontLegId);

    initNodes(rightUpperFrontLegId);
    initNodes(rightLowerFrontLegId);

    initNodes(leftUpperBackLegId);
    initNodes(leftLowerBackLegId);

    initNodes(rightUpperBackLegId);
    initNodes(rightLowerBackLegId);

    step++;

    return step;
}

function stop() {

    theta[leftUpperFrontLegId] = initTheta[leftUpperFrontLegId];
    theta[leftLowerFrontLegId] = initTheta[leftLowerFrontLegId];

    theta[rightUpperFrontLegId] = initTheta[rightUpperFrontLegId];
    theta[rightLowerFrontLegId] = initTheta[rightLowerFrontLegId];


    theta[leftUpperBackLegId] = initTheta[leftUpperBackLegId];
    theta[leftLowerBackLegId] = initTheta[leftLowerBackLegId];

    theta[rightUpperBackLegId] = initTheta[rightUpperBackLegId];
    theta[rightLowerBackLegId] = initTheta[rightLowerBackLegId];


    initNodes(torsoId);

    initNodes(leftUpperFrontLegId);
    initNodes(leftLowerFrontLegId);

    initNodes(rightUpperFrontLegId);
    initNodes(rightLowerFrontLegId);

    initNodes(leftUpperBackLegId);
    initNodes(leftLowerBackLegId);

    initNodes(rightUpperBackLegId);
    initNodes(rightLowerBackLegId);
}

function animation() {
    var walk_step = 1;
    var jump_step = 1;

    torsoTranslate = [0.0, (carpetHeight+upperLegHeight+lowerLegHeight), -(0.5*carpetWidth-0.5*torsoWidth)];

    var towards_table = setInterval(function() {
        walk_step = walk(walk_step);

    }, 200);

    setTimeout(function() {
        clearInterval(towards_table); 

        var on_table = setInterval(function() {
            jump_step = jump(jump_step);
        }, 150);
        
        setTimeout(function() {
            clearInterval(on_table);

            var towards_table_center = setInterval(function() {
                walk_step = walk(walk_step);
            }, 150);

            setTimeout(function() {
                clearInterval(towards_table_center);

                stop();
            }, 700);

        }, 900);

    }, 3800);
}



/*--------------------------------RENDER--------------------------------*/

var render = function() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta_view)*Math.cos(phi), 
               radius*Math.sin(theta_view)*Math.sin(phi), 
               radius*Math.cos(theta_view));

    modelViewMatrix = lookAt(eye, at, up);

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);

    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPosition);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    nMatrix = normalMatrix(modelViewMatrix, true);
    gl.uniformMatrix3fv( gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));

    
    if(animate===true) {
        animation();
        animate = false;
    }

    traverse(surface, carpetId);
    traverse(figure, torsoId);
    traverse(table, tableSurfaceId);

    requestAnimationFrame(render);
}