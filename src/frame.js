import React, { PropTypes } from 'react'
import GL from 'gl-react'

const shaders = GL.Shaders.create({
	frame: {
		frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec4 crop;
vec2 invert (vec2 p) {${""}
  return vec2(p.x, 1.0-p.y);
}
void main () {
  vec2 p = invert(invert(uv) * crop.zw + crop.xy);
  gl_FragColor =
    texture2D(t, p);
}`
	}
})

export default GL.createComponent(({
		width,
		height,
		source,
		size,
		move,
		position,
	}) => {
	  const { width: imageWidth, height: imageHeight } = size
	  const viewportRatio = width / height
	  const imageRatio = imageWidth / imageHeight
	  const ratio = Math.max(viewportRatio, imageRatio)

	  var canvasSize = [
	  	(viewportRatio / ratio) * imageWidth,
	  	(imageRatio / ratio) * imageHeight,
	  ]

	  let r = canvasSize[0] / canvasSize[1]

	  if (canvasSize[0] > imageWidth) {
	  	canvasSize[0] = imageWidth
	  	canvasSize[1] = ~~(canvasSize[0] / r)
	  }

	  if (canvasSize[1] > imageHeight) {
	  	canvasSize[1] = imageHeight
	  	canvasSize[0] = ~~(canvasSize[1] * r)
	  }

	  let rectangle = [
	  	imageWidth * position[0] - canvasSize[0] / 2,
	  	imageHeight * position[1] - canvasSize[1] / 2,
	  	canvasSize[0],
	  	canvasSize[1],
	  ]

	  rectangle[0] = move === 'horizontal' ? rectangle[0] : Math.max(0, Math.min(rectangle[0], imageWidth - canvasSize[0]))
	  rectangle[1] = move === 'vertical' ? rectangle[1] : Math.max(0, Math.min(rectangle[1], imageHeight - canvasSize[1]))

	  let crop = [
	  	rectangle[0] / imageWidth,
	  	rectangle[1] / imageHeight,
	  	rectangle[2] / imageWidth,
	  	rectangle[3] / imageHeight,
	  ]

	  return <GL.Node
	  	shader = { shaders.frame}
	  	uniforms = {{
	  		t: source,
	  		crop,
	  	}} />
	}, {
	displayName: "Frame"
})
