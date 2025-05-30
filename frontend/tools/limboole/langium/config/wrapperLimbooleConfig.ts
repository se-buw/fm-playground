import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLocalizationServiceOverride from '@codingame/monaco-vscode-localization-service-override';
import { createDefaultLocaleConfiguration } from 'monaco-languageclient/vscode/services';
import { LogLevel } from 'vscode/services';
import { LanguageClientConfig, WrapperConfig } from 'monaco-editor-wrapper';
import limbooleLanguageConfig from './language-configuration.json?raw';
import responseLimbooleTm from '../syntaxes/limboole.tmLanguage.json?raw';
import { MessageTransports } from 'vscode-languageclient';
import { configureMonacoWorkers } from '../utils.js';

export const createLangiumGlobalConfig = async (params: {
  languageServerId: string;
  useLanguageClient: boolean;
  text?: string;
  worker?: Worker;
  messagePort?: MessagePort;
  messageTransports?: MessageTransports;
}): Promise<WrapperConfig> => {
  const extensionFilesOrContents = new Map<string, string | URL>();
  extensionFilesOrContents.set(`/${params.languageServerId}-limboole-configuration.json`, limbooleLanguageConfig);
  extensionFilesOrContents.set(`/${params.languageServerId}-limboole-grammar.json`, responseLimbooleTm);

  let main;
  if (params.text !== undefined) {
    main = {
      text: params.text,
      fileExt: 'limboole',
    };
  }

  const languageClientConfigs: Record<string, LanguageClientConfig> | undefined =
    params.useLanguageClient && params.worker
      ? {
          limboole: {
            languageId: 'limboole',
            connection: {
              options: {
                $type: 'WorkerDirect',
                worker: params.worker,
                messagePort: params.messagePort,
              },
              messageTransports: params.messageTransports,
            },
          },
        }
      : undefined;

  return {
    logLevel: LogLevel.Warning, // FIXME: LogLevel.Error on deployment
    serviceConfig: {
      userServices: {
        ...getKeybindingsServiceOverride(),
        ...getLifecycleServiceOverride(),
        ...getLocalizationServiceOverride(createDefaultLocaleConfiguration()),
      },
    },
    editorAppConfig: {
      $type: 'extended',
      editorOptions: {
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
        main,
      },
      useDiffEditor: false,
      extensions: [
        {
          config: {
            name: 'limboole-example',
            publisher: 'soaibuzzaman',
            version: '1.0.0',
            engine: {
              vscode: '*',
            },
            contributes: {
              languages: [
                {
                  id: 'limboole',
                  extensions: ['.limboole'],
                  aliases: ['limboole', 'Limboole'],
                  configuration: `./${params.languageServerId}-limboole-configuration.json`,
                },
              ],
              grammars: [
                {
                  language: 'limboole',
                  scopeName: 'source.limboole',
                  path: `./${params.languageServerId}-limboole-grammar.json`,
                },
              ],
            },
          },
          filesOrContents: extensionFilesOrContents,
        },
      ],
      userConfiguration: {
        json: JSON.stringify({
          'workbench.colorTheme': 'Default Light Modern',
          'editor.guides.bracketPairsHorizontal': 'active',
          'editor.wordBasedSuggestions': 'off',
          'editor.experimental.asyncTokenization': true,
        }),
      },
      monacoWorkerFactory: configureMonacoWorkers,
    },
    languageClientConfigs,
  };
};
