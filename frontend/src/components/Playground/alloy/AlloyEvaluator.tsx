import React from 'react';
import PlainOutput from '../PlainOutput';
import { MDBInput } from 'mdb-react-ui-kit';
import { getAlloyEval } from '../../../api/toolsApi';
interface AlloyEvaluatorProps {
  height: string;
  specId: string | null;
  state: number;
  evaluatorOutput: string;
  setEvaluatorOutput: (evaluatorOutput: string) => void;
}

const AlloyEvaluator: React.FC<AlloyEvaluatorProps> = ({ height, specId, state, evaluatorOutput, setEvaluatorOutput }) => {

  const handleEvaluate = (expr: string) => {
    if (!expr || !specId) return;
    getAlloyEval(specId, expr, state)
      .then((res) => {
        if (res.result) {
          setEvaluatorOutput( expr + '<br>&nbsp;&nbsp;' + res.result + '<br>' + evaluatorOutput );
        } else if (res.error) {
          setEvaluatorOutput(expr + '<br>&nbsp;&nbsp;<span style="color: red;">' + res.error + '</span><br>' + evaluatorOutput);
        }
      });
  }

  const handleClear = () => {
    setEvaluatorOutput('');
  }

  return (
    <>
      <MDBInput
        label="Alloy Expressions"
        id="alloyExprForm"
        type="text"
        className='alloy-eval-expression-input'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleEvaluate(e.currentTarget.value);
          }
        }}
      />
      <div style={{ position: 'relative' }}>
        <button className="alloy-eval-close-icon" onClick={handleClear} >&times;</button>
        <PlainOutput
          code={evaluatorOutput}
          height={height}
          onChange={() => { }}
        />
      </div>

    </>

  );
}

export default AlloyEvaluator;

