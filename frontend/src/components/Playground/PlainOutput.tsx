import { useAtom } from 'jotai';
import '@/assets/style/Playground.css';
import { outputAtom, outputPreviewHeightAtom } from '@/atoms';


const PlainOutput = () => {
  const [code] = useAtom(outputAtom);
  const [outputPreviewHeight] = useAtom(outputPreviewHeightAtom);
  
  return (
    <pre
      id='info'
      className='plain-output-box'
      contentEditable={false}
      style={{
        borderRadius: '8px',
        height: outputPreviewHeight,
        whiteSpace: 'pre-wrap'
      }}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default PlainOutput;
