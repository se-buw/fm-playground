import playgroundConfig from '../../playground.json';

const playground: Playground = playgroundConfig as Playground;

export const getTitle = (): PlaygroundTitle => {
  const title: string = playground.title;
  return { title };
};

export const getToolsForDropdown = () => {
  const tools = Object.keys(playground.tools).map((key) => {
    const tool = playground.tools[key];
    return {
      label: tool.dropdownLabel,
      value: tool.dropdownValue,
    };
  });
  return tools;
};