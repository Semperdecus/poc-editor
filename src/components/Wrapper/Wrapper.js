import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Wrapper.module.css';
//import Editor2 from '../Editor2/Editor2.js';
import Editor from '../Editor/Editor.js';

const Wrapper = () => {
  return (
    <div className={styles.Wrapper}>
      {/* <YamlEditor value={this.state.value} /> */}
      <Editor />
    </div>
  );
};

export default Wrapper;
