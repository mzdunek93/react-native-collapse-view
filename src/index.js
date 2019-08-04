import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from "react-native";

const propTypes = {
  renderView: PropTypes.func.isRequired,
  renderCollapseView: PropTypes.func.isRequired,
  collapse: PropTypes.bool,
  tension: PropTypes.number,
  onOpen: PropTypes.func
}
const defaultProps = {
  collapse: false,
  duration: 200
};

class CollapseView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: this.props.collapse,
      animation: new Animated.Value(),
      startpoint: null,
      endpoint: null
    };
  }

  ref = React.createRef()

  collapse = () => {
    const { startpoint, endpoint, animation, collapse } = this.state;
    let startAnim = collapse? endpoint + startpoint : startpoint;
    let endAnim = collapse? startpoint : startpoint + endpoint;
    this.setState({
      collapse: !this.state.collapse
    })
    
    animation.setValue(startAnim);
    Animated.timing(
      this.state.animation,
      {
        toValue: endAnim,
        duration: this.props.duration
      }
    ).start(() => {
      if (!collapse && this.props.onOpen && this.ref.current) {
        requestAnimationFrame(() => {
          this.ref.current._component.measure((x, y, width, height, pageX, pageY) => {
            this.props.onOpen(pageY, height)
          })
        })
      }
    });
  }

  startpoint = (layout) => {
    if (!this.state.collapse) this.setState({ animation: new Animated.Value(layout.nativeEvent.layout.height) });
    else this.setState({ animation: new Animated.Value(layout.nativeEvent.layout.height + this.state.endpoint) });
    this.setState({
      startpoint: layout.nativeEvent.layout.height
    })
  }

  endpoint = (layout) => {
    if(this.state.collapse) this.setState({animation: new Animated.Value(layout.nativeEvent.layout.height + this.state.startpoint)});
    this.setState({
      endpoint: layout.nativeEvent.layout.height,
    })
  }

  render() {
    const { startpoint, endpoint, animation, collapse } = this.state;
    const height = startpoint !== null && endpoint !== null ? animation : null

    return (
      <Animated.View style={{height, backgroundColor:'transparent', overflow: 'hidden'}} ref={this.ref}>
        <TouchableOpacity activeOpacity={1} onPress={this.collapse} onLayout={this.startpoint}>
          {this.props.renderView(collapse)}
        </TouchableOpacity>
        <View onLayout={this.endpoint}>
          {this.props.renderCollapseView(collapse)}
        </View>
      </Animated.View>
    );
  }
}

CollapseView.propTypes = propTypes;
CollapseView.defaultProps = defaultProps;
export default CollapseView;