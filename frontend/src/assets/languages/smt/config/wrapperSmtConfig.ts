import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLocalizationServiceOverride from '@codingame/monaco-vscode-localization-service-override';
import { createDefaultLocaleConfiguration } from 'monaco-languageclient/vscode/services';
import { LogLevel } from 'vscode/services';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageclient/browser.js';
import {WrapperConfig } from 'monaco-editor-wrapper';
import smtLanguageConfig from './language-configuration.json?raw';
import responseSmtTm from '../syntaxes/smt.tmLanguage.json?raw';
import { configureMonacoWorkers } from '../utils';
import workerPortUrlSmt from '../worker/smt-server-port?worker&url';

const loadLangiumWorkerPort = () => {
  return new Worker(workerPortUrlSmt, {
    type: 'module',
    name: 'Smt Server Port',
  });
}

export const createLangiumSmtConfig = async (): Promise<WrapperConfig> => {
  const extensionFilesOrContents = new Map<string, string | URL>();
  extensionFilesOrContents.set(`/smt-configuration.json`, smtLanguageConfig);
  extensionFilesOrContents.set(`/-smt-grammar.json`, responseSmtTm);

  const smtWorkerPort = loadLangiumWorkerPort();
  smtWorkerPort.onmessage = (event) => {
  };

  const channel = new MessageChannel();
  smtWorkerPort.postMessage({ port: channel.port2 }, [channel.port2]);

  const reader = new BrowserMessageReader(channel.port1);
  const writer = new BrowserMessageWriter(channel.port1);
  reader.listen((message) => {
  });

  return {
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
      codeResources: {
        main: {
          text: '(check-sat)',
          fileExt: 'smt2'
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
        filesOrContents: extensionFilesOrContents
      }],
      userConfiguration: {
        json: JSON.stringify({
          'workbench.colorTheme': 'Default Dark Modern',
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
            messagePort: channel.port1,
          },
          messageTransports: { reader, writer }
        }
      }
    }
  }
}