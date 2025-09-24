import React from 'react';
import { Text } from 'react-native';

const MockIcon = (props) => {
  return React.createElement(Text, props, props.name || '');
};

export default MockIcon;