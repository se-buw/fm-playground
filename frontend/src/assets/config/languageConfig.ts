import fmpConfig from '../../../fmp.config';

const languageOptions = Object.values(fmpConfig.tools).map(tool => ({
  id: tool.extension,
  value: tool.dropdown.value,
  label: tool.dropdown.label,
  short: tool.shortName
}));

export default languageOptions;
