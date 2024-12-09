import React, { useState } from 'react';
import PlainOutput from '../PlainOutput';
import { MDBInput } from 'mdb-react-ui-kit';
import { getAlloyEval } from '../../../api/toolsApi';
interface AlloyEvaluatorProps {
  height: string;
  specId: string | null;
  state: number;
}

const AlloyEvaluator: React.FC<AlloyEvaluatorProps> = ({ height, specId, state }) => {
  const [code, setCode] = useState('');

  const handleEvaluate = (expr: string) => {
    if (!expr || !specId) return;
    getAlloyEval(specId, expr, state)
      .then((res) => {
        if (res.result) {
          setCode( expr + '<br>&nbsp;&nbsp;' + res.result + '<br>' + code );
        } else if (res.error) {
          setCode(expr + '<br>&nbsp;&nbsp;<span style="color: red;">' + res.error + '</span><br>' + code);
        }
      });
  }

  const handleClear = () => {
    setCode('');
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
          code={code}
          height={height}
          onChange={() => { }}
        />
      </div>

    </>

  );
}

export default AlloyEvaluator;

