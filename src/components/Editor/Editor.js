import React, { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-yaml/esm/monaco.contribution';
import { languages } from 'monaco-editor/esm/vs/editor/editor.api';
import AppDefinition from '../../../appDefinition.jsx';
import Toolbox from '../Toolbox/Toolbox.js';

// NOTE: This will give you all editor featues. If you would prefer to limit to only the editor
// features you want to use, import them each individually. See this example: (https://github.com/microsoft/monaco-editor-samples/blob/master/browser-esm-webpack-small/index.js#L1-L91)
import 'monaco-editor';

window.MonacoEnvironment = {
  getWorkerUrl(moduleId, label) {
    if (label === 'yaml') {
      return './yaml.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  },
};

const { yaml } = languages || {};

const Editor = () => {
  const [value, setValue] = useState(AppDefinition);
  const [editorState, setEditor] = useState();
  const [monacoState, setMonaco] = useState();
  const [loading, setLoading] = useState(true);
  const [selectionState, setSelection] = useState();
  const [errors, setErrors] = useState(false);
  const [addBlockAllowed, setAddBlockAllowed] = useState(false);
  const [blocksLine, setBlocksLine] = useState();

  function selectedItemContainsBlockParent(item) {
    let allowed = false;
    if (item[0] !== undefined) {
      item[0].parents.map(parent => {
        if (parent[0].name === 'blocks') {
          setBlocksLine(parent[1].line);
          allowed = true;
        }
      });
    }
    setAddBlockAllowed(allowed);
  }

  function getSelectedItemParents(model, position) {
    const lines = model.getValue().split('\n');
    const selectedItem = [];
    for (let i = 1; i <= lines.length; i++) {
      if (i !== 1) {
        // if indent is not 1 look for parent structure
        if (model.getLineFirstNonWhitespaceColumn(i) > 1) {
          let newIndent = model.getLineFirstNonWhitespaceColumn(i);
          let parents = [];
          let pC = 1;

          if (i === position.lineNumber) {
            while (newIndent !== 1) {
              if (newIndent > model.getLineFirstNonWhitespaceColumn(i - pC)) {
                newIndent = model.getLineFirstNonWhitespaceColumn(i - pC);
                parents.push([
                  {
                    name: model
                      .getLineContent(i - pC)
                      .trim()
                      .replace(':', ''),
                  },
                  { line: i - pC },
                  { indent: newIndent },
                ]);
              }
              pC += 1;
            }

            selectedItem.push({
              content: model.getLineContent(i).trim(),
              indent: model.getLineFirstNonWhitespaceColumn(i),
              parents: parents,
            });
          }
        }
      }
    }
    selectedItemContainsBlockParent(selectedItem);
  }

  async function editorDidMount(editor, monaco) {
    setEditor(editor);
    setMonaco(monaco);
    setLoading(false);

    editor.onDidChangeModelContent(() => {
      // test of getting error markers
      setTimeout(() => {
        const markers = monaco.editor.getModelMarkers({});
        if (markers.length === 0) {
          setErrors(false);
        } else {
          setErrors(true);
        }
      }, 1000);
    });

    // Breadcrumbs emulation:
    editor.onDidChangeCursorSelection(({ selection }) => {
      setSelection(selection);
      const model = editor.getModel();
      const position = selection.getPosition();

      getSelectedItemParents(model, position);

      // require([
      //   '../../../node_modules/monaco-editor/esm/vs/editor/contrib/quickOpen/quickOpen.js',
      // ], quickOpen => {
      //   console.log(quickOpen);
      //   quickOpen.getDocumentSymbols(model).then(console.log('hi'));
      // });
    });
  }

  useEffect(() => {
    yaml &&
      yaml.yamlDefaults.setDiagnosticsOptions({
        validate: true,
        enableSchemaRequest: true,
        hover: true,
        completion: true,
        schemas: [
          {
            uri: 'http://myserver/foo-schema.json', // id of the first schema
            fileMatch: ['*'], // associate with our model
            schema: {
              name: 'http://myserver/foo-schema.json', // id of the first schema
              properties: {
                resources: {
                  litter: {
                    schema: {
                      type: {
                        enum: ['v1', 'v2'],
                      },
                    },
                  },
                },
                p1: {
                  enum: ['v1', 'v2'],
                },
                p2: {
                  $ref: 'http://myserver/bar-schema.json', // reference the second schema
                },
              },
            },
          },
          {
            uri: 'http://myserver/bar-schema.json', // id of the first schema
            schema: {
              id: 'http://myserver/bar-schema.json', // id of the first schema
              type: 'object',
              properties: {
                q1: {
                  enum: ['x1', 'x2'],
                },
              },
            },
          },
        ],
      });
  }, []);

  return (
    <div>
      {loading ? (
        ''
      ) : (
        <Toolbox
          editor={editorState}
          selection={selectionState}
          monaco={monacoState}
          errors={errors}
          addBlock={addBlockAllowed}
          blocksLine={blocksLine}
        />
      )}
      <MonacoEditor
        width="800"
        height="600"
        language="yaml"
        value={value}
        onChange={setValue}
        editorDidMount={editorDidMount}
      />
    </div>
  );
};

export default Editor;
