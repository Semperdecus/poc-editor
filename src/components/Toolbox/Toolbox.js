import React from 'react';
import PropTypes from 'prop-types';
import styles from './Toolbox.module.css';

const Toolbox = params => {
  const model = params.editor.getModel();
  const editor = params.editor;
  const monaco = params.monaco;
  const selection = params.selection;
  const blocksLine = params.blocksLine;

  function getSelectedText() {
    console.log(model.getValueInRange(editor.getSelection()));
  }

  function getErrors() {
    console.log(params.errors);
  }
  function addBlock() {
    var line = editor.getPosition();
    var range = new monaco.Range(blocksLine + 1, 1, blocksLine + 1, 1);
    var id = { major: 1, minor: 1 };
    var text = `      - type: markdown
        version: 0.11.6
        parameters:
          content: new block\n`;
    var op = {
      identifier: id,
      range: range,
      text: text,
      forceMoveMarkers: true,
    };
    editor.executeEdits('my-source', [op]);
  }

  function getSelection() {
    if (selection) {
      const position = selection.getPosition();

      //console.log(selection);
      console.log('linecontent', model.getLineContent(position.lineNumber)); // get line content
      console.log(
        'indentRange',
        model.getLineFirstNonWhitespaceColumn(position.lineNumber)
      );
    }
  }

  return (
    <div>
      <button onClick={getSelectedText}>Get selected text</button>
      <button onClick={getErrors}>Are there errors</button>
      <button onClick={getSelection}>Get selection</button>
      <button disabled={!params.addBlock} onClick={addBlock}>
        Add block
      </button>
    </div>
  );
};

export default Toolbox;
