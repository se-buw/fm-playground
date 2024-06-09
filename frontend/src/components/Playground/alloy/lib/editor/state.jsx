import useLocalStorage from '../../../../../hooks/useLocalStorage'

let instances = [];

export const useAlloyState = () => {
  const [modelUpdated, setModelUpdated] = useLocalStorage('model-updated', false);
  const [modelShared, setModelShared] = useLocalStorage('model-shared', false);
  const [logMessage, setLogMessage] = useLocalStorage('log-message', '');
  const [logClass, setLogClass] = useLocalStorage('log-class', '');
  const [currentInstance, setCurrentInstance] = useLocalStorage('currentInstance', 0);
  const [currentState, setCurrentState] = useLocalStorage('currentState', 0);
  const [maxInstance, setMaxInstance] = useLocalStorage('maxInstance', -1);
  const [instUpdated, setInstUpdated] = useLocalStorage('inst-updated', false);
  const [instShared, setInstShared] = useLocalStorage('inst-shared', false);
  const [commands, setCommands] = useLocalStorage('commands', []);

  const handleModelChanged = () => {
    setModelUpdated(true);
    setModelShared(false);
    setLogMessage('');
    setLogClass('');
    setCurrentInstance(0);
    setCurrentState(0);
    setMaxInstance(-1);
  };

  const handleCmdChanged = () => {
    setModelUpdated(true);
  };

  const handleModelExecuted = () => {
    setModelUpdated(false);
    instChanged();
    setCurrentInstance(false);
  };

  const handleInstChanged = () => {
    setInstUpdated(!instUpdated);
    setInstShared(false);
  };

  const handleThemeChanged = () => {
    setModelShared(false);
    setInstShared(false);
  };

  const handleModelShared = () => {
    setModelShared(true);
  };

  const handleInstShared = () => {
    setInstShared(true);
  };

  const storeInstances = (allInstances) => {
    if (allInstances.alloy_error || allInstances[0].cnt === 0) {
      instances = allInstances;
      setCurrentInstance(0);
      setMaxInstance(allInstances[0] && !allInstances[0].unsat ? allInstances.length : -1);
    } else {
      instances = instances.concat(allInstances);
      setMaxInstance(maxInstance + allInstances.length);
    }
  };

  const getCurrentState = () => {
    if (!instances[currentInstance]) return undefined;
    return instances[currentInstance].instance[currentState];
  };

  const getCurrentTrace = () => {
    if (!instances) return undefined;
    return instances[currentInstance];
  };

  const getNextInstance = () => {
    setCurrentInstance(currentInstance + 1);
    if (!instances[currentInstance + 1]) return undefined;
    if (instances[currentInstance + 1].unsat) return instances[currentInstance + 1];
    return instances[currentInstance + 1].instance[currentState];
  };

  const getPreviousInstance = () => {
    setCurrentInstance(currentInstance - 1);
    return instances[currentInstance - 1].instance[currentState];
  };

  const nextState = () => {
    if (currentState + 1 === instances[currentInstance].instance.length) {
      setCurrentState(instances[currentInstance].loop);
    } else {
      setCurrentState(currentState + 1);
    }
    return getCurrentState();
  };

  const handleResetState = () => {
    setCurrentState(0);
  };

  const handlePrevState = () => {
    if (currentState > 0) {
      setCurrentState(currentState - 1);
    }
    return getCurrentState();
  };

  const isUnsatInstance = (i) => {
    return instances[i].unsat;
  };

  const getCommandIndex = () => {
    let i = -1;
    if (commands.length === 1) {
      i = 0;
    } else if (commands.length > 0) {
      i = document.querySelector('.command-selection > select option:selected').index();
    }
    return i;
  };

  const getCommandLabel = () => {
    let command;
    if (commands.length <= 1) {
      command = commands[0];
    } else {
      command = document.querySelector('.command-selection > select option:selected').text();
    }
    return command;
  };

  return {
    handleModelChanged,
    handleCmdChanged,
    handleModelExecuted,
    handleInstChanged,
    handleThemeChanged,
    handleModelShared,
    handleInstShared,
    storeInstances,
    getCurrentState,
    getCurrentTrace,
    getNextInstance,
    getPreviousInstance,
    nextState,
    handleResetState,
    handlePrevState,
    isUnsatInstance,
    getCommandIndex,
    getCommandLabel,
    setCommands,
    commands,
    modelUpdated,
    modelShared,
    logMessage,
    logClass,
    currentInstance,
    currentState,
    maxInstance,
    instUpdated,
    instShared
  };
};
