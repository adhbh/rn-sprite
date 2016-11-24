import React, { Component } from 'react'
import { View, Image } from 'react-native'

import { Surface } from 'gl-react-native'
import Frame from './frame'

export default class Sprite extends Component {
  constructor(props) {
    super (props)
    let { loop = false, move = 'horizontal', fps = 2, sequence } = this.props

    if (!this.props.source)
      throw new Error('rn-sprite: source is the required prop')

    if (!this.props.sequence)
      throw new Error('n-sprite: sequence is the required prop')

    this.state = {
      current: 0,
      imageSize: null,
      pressed: false,
      sequence: [],
      frames: 0,
    }

    this.move = move !== 'vertical' ? 'horizontal' : move
    this.speed = 1000 / fps
    this.loopInterval = null
    this.loop = loop

    this.totalFrames = sequence.length

    this.play = this.play.bind(this)
    this.stop = this.stop.bind(this)
    this.forward = this.forward.bind(this)
    this.backward = this.backward.bind(this)

    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
  }

  componentWillMount () {
    Image.getSize(this.props.source, (width, height) =>
      this.setState({
        imageSize: { width, height },
        current: this.props.sequence[0],
        sequence: this.props.sequence,
      }))
  }

  onTouchStart (evt) {
    this.setState({ pressed: true })
    if (this.props.onTouchStart)
      this.props.onTouchStart(evt)    
  }

  onTouchMove (evt) {
    if (this.props.onTouchMove)
      this.props.onTouchMove(evt)
  }

  onTouchEnd () {
    this.setState({
      pressed: false
    })
    if (this.props.onTouchEnd)
      this.props.onTouchEnd()
  }

  play (fps) {
    this.speed = 1000 / fps
    this.loopInterval = setInterval( () => {
      this.forward()
    }, this.speed)
  }

  stop () {
    clearInterval(this.loopInterval)
  }

  forward () {
    const current = this.state.sequence[this.state.frames]
    const frames = this.state.frames + 1

    this.setState({ current, frames })

    if(this.state.frames >= this.totalFrames) {
      if(!this.loop) {
        clearInterval(this.loopInterval)
      }
      this.setState({ current: this.state.sequence[0], frames: 1 })
    }
  }

  backward () {
    const current = this.state.sequence[this.state.frames]
    let frames = this.state.frames - 1 < 0 ? this.totalFrames - 1 : this.state.frames - 1

    this.setState({ current, frames })
  }

  componentDidMount () {
    const { isPlaying = true, fps = 2 } = this.props
    if(isPlaying) {
      this.play(fps)
    }
  }

  componentWillReceiveProps ({ isPlaying = true, fps }) {
    this.stop()
    if (isPlaying) {
      this.play(fps)
    }
  }

  render () {
    const { imageSize } = this.state
    if (!imageSize) return <View />

    return (
      <Surface
        onStartShouldSetResponderCapture={ () => true }
        onMoveShouldSetResponderCapture={ () => true}
        onResponderTerminationRequest={ () => false }
        onResponderGrant={ this.onTouchStart }
        onResponderMove={ this.onTouchMove }
        onResponderRelease={ this.onTouchEnd }
        onResponderTerminate={ this.onTouchEnd }
        { ...this.props } >
          <Frame source = { this.props.source }
          size = { imageSize }
          move = { this.move }
          position = { this.move === 'vertical' ? [ 0, this.state.current ] : [ this.state.current, 0 ] } />
      </Surface>
    );
  }
}