import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLocalizationServiceOverride from '@codingame/monaco-vscode-localization-service-override';
import { createDefaultLocaleConfiguration } from 'monaco-languageclient/vscode/services';
import { LogLevel } from 'vscode/services';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageclient/browser.js';
import {WrapperConfig } from 'monaco-editor-wrapper';
import spectraLanguageConfig from './language-configuration.json?raw';
import responseSpectraTm from '../syntaxes/spectra.tmLanguage.json?raw';
import { configureMonacoWorkers } from '../utils';
import workerPortUrlSpectra from '../worker/spectra-server-port?worker&url';

const loadLangiumWorkerPort = () => {
  // Language Server preparation
  console.log(`Langium worker URL: ${workerPortUrlSpectra}`);
  return new Worker(workerPortUrlSpectra, {
    type: 'module',
    name: 'Smt Server Port',
  });
}

export const createLangiumSmtConfig = async (): Promise<WrapperConfig> => {
  const extensionFilesOrContents = new Map<string, string | URL>();
  extensionFilesOrContents.set(`/spectra-configuration.json`, spectraLanguageConfig);
  extensionFilesOrContents.set(`/-spectra-grammar.json`, responseSpectraTm);

  const spectraWorkerPort = loadLangiumWorkerPort();
  spectraWorkerPort.onmessage = (event) => {
    console.log('Received message from worker:', event.data);
  };

  const channel = new MessageChannel();
  spectraWorkerPort.postMessage({ port: channel.port2 }, [channel.port2]);

  const reader = new BrowserMessageReader(channel.port1);
  const writer = new BrowserMessageWriter(channel.port1);
  reader.listen((message) => {
    console.log('Received message from worker:', message);
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
          fileExt: 'spectra',
        }
      },
      useDiffEditor: false,
      extensions: [{
        config: {
          name: 'spectra-example',
          publisher: 'soaibuzzaman',
          version: '1.0.0',
          engine: {
            vscode: '*'
          },
          contributes: {
            languages: [{
              id: 'spectra',
              extensions: ['.spectra'],
              aliases: ['spectra', 'Spectra'],
              configuration: `./spectra-configuration.json`
            }],
            grammars: [{
              language: 'spectra',
              scopeName: 'source.spectra',
              path: `./spectra-grammar.json`
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
      spectra: {
        languageId: 'spectra',
        connection: {
          options: {
            $type: 'WorkerDirect',
            worker: spectraWorkerPort,
            messagePort: channel.port1,
          },
          messageTransports: { reader, writer }
        }
      }
    }
  }
}