import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLocalizationServiceOverride from '@codingame/monaco-vscode-localization-service-override';
import { createDefaultLocaleConfiguration } from 'monaco-languageclient/vscode/services';
import { LogLevel } from 'vscode/services';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageclient/browser.js';
import { WrapperConfig } from 'monaco-editor-wrapper';
import { configureMonacoWorkers } from './limboole/utils';
// limboole specific imports
import workerPortUrlLimboole from './limboole/worker/limboole-server-port?worker&url';
import limbooleLanguageConfig from './limboole/config/language-configuration.json?raw';
import responseLimbooleTm from './limboole/syntaxes/limboole.tmLanguage.json?raw';
// Smt specific imports
import workerPortUrlSmt from './smt/worker/smt-server-port?worker&url';
import smtLanguageConfig from './smt/config/language-configuration.json?raw';
import responseSmtTm from './smt/syntaxes/smt.tmLanguage.json?raw';

const loadSmtpWorkerPort = () => {
  console.log(`Smt worker URL: ${workerPortUrlSmt}`);
  return new Worker(workerPortUrlSmt, {
    type: 'module',
    name: 'Smt Server Port',
  });
}

const loadLimbooleWorkerPort = () => {
  console.log(`Limboole worker URL: ${workerPortUrlLimboole}`);
  return new Worker(workerPortUrlLimboole, {
    type: 'module',
    name: 'Limboole Server Port',
  });
}

export const createLangiumGlobalConfig = async (): Promise<WrapperConfig> => {
  const limbooleExtensionFilesOrContents = new Map<string, string | URL>();
  limbooleExtensionFilesOrContents.set(`/limboole-configuration.json`, limbooleLanguageConfig);
  limbooleExtensionFilesOrContents.set(`/limboole-grammar.json`, responseLimbooleTm);

  const smtExtensionFilesOrContents = new Map<string, string | URL>();
  smtExtensionFilesOrContents.set(`/smt-configuration.json`, smtLanguageConfig);
  smtExtensionFilesOrContents.set(`/smt-grammar.json`, responseSmtTm);

  const smtWorkerPort = loadSmtpWorkerPort();
  const limbooleWorkerPort = loadLimbooleWorkerPort();

  const smtChannel = new MessageChannel();
  smtWorkerPort.postMessage({ port: smtChannel.port2 }, [smtChannel.port2]);

  const limbooleChannel = new MessageChannel();
  limbooleWorkerPort.postMessage({ port: limbooleChannel.port2 }, [limbooleChannel.port2]);

  const smtReader = new BrowserMessageReader(smtChannel.port1);
  const smtWriter = new BrowserMessageWriter(smtChannel.port1);

  const limbooleReader = new BrowserMessageReader(limbooleChannel.port1);
  const limbooleWriter = new BrowserMessageWriter(limbooleChannel.port1);

  return {
    id: '42',
    logLevel: LogLevel.Debug,
    serviceConfig: {
      userServices: {
        ...getKeybindingsServiceOverride(),
        ...getLifecycleServiceOverride(),
        ...getLocalizationServiceOverride(createDefaultLocaleConfiguration()),
      }
    },
    editorAppConfig: {
      $type: 'extended',
      editorOptions:{
        minimap: {
          enabled: false,
        },
        automaticLayout: true,
        mouseWheelZoom: true,
        bracketPairColorization: {
          enabled: true,
          independentColorPoolPerBracketType: true,
        },
        glyphMargin: false,
      },
      codeResources: {
        main: {
          text: '',
          fileExt: ''
        }
      },
      useDiffEditor: false,
      extensions: [{
        config: {
          name: 'smt-example',
          publisher: 'soaibuzzaman',
          version: '1.0.0',
          engine: {
            vscode: '*'
          },
          contributes: {
            languages: [{
              id: 'smt',
              extensions: ['.smt2'],
              aliases: ['smt', 'Smt'],
              configuration: `./smt-configuration.json`
            }],
            grammars: [{
              language: 'smt',
              scopeName: 'source.smt',
              path: `./smt-grammar.json`
            }]
          }
        },
        filesOrContents: smtExtensionFilesOrContents
      },
      {
        config: {
          name: 'limboole-example',
          publisher: 'soaibuzzaman',
          version: '1.0.0',
          engine: {
            vscode: '*'
          },
          contributes: {
            languages: [{
              id: 'limboole',
              extensions: ['.limboole'],
              aliases: ['limboole', 'Limboole'],
              configuration: `./limboole-configuration.json`
            }],
            grammars: [{
              language: 'limboole',
              scopeName: 'source.limboole',
              path: `./limboole-grammar.json`
            }]
          }
        },
        filesOrContents: limbooleExtensionFilesOrContents
      }],
      userConfiguration: {
        json: JSON.stringify({
          'workbench.colorTheme': 'Default Light Modern',
          'editor.guides.bracketPairsHorizontal': 'active',
          'editor.wordBasedSuggestions': 'off',
          'editor.experimental.asyncTokenization': true
        })
      },
      monacoWorkerFactory: configureMonacoWorkers
    },
    languageClientConfigs: {
      smt: {
        languageId: 'smt',
        connection: {
          options: {
            $type: 'WorkerDirect',
            worker: smtWorkerPort,
            messagePort: smtChannel.port1,
          },
          messageTransports: { reader: smtReader, writer: smtWriter }
        },
      },
      limboole: {
        languageId: 'limboole',
        connection: {
          options: {
            $type: 'WorkerDirect',
            worker: limbooleWorkerPort,
            messagePort: limbooleChannel.port1,
          },
          messageTransports: { reader: limbooleReader, writer: limbooleWriter }
        },
      }
    },
  };
}