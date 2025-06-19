import { useAtom } from 'jotai';
import { outputAtom, outputPreviewHeightAtom } from '@/atoms';
import '@/assets/style/Playground.css';

const PlainOutput = () => {
    const [code] = useAtom(outputAtom);
    const [outputPreviewHeight] = useAtom(outputPreviewHeightAtom);

    const containsHTML = /<[^>]*>/.test(code);

    return (
        <pre
            id='info'
            className='plain-output-box'
            contentEditable={false}
            style={{
                borderRadius: '8px',
                height: outputPreviewHeight,
                whiteSpace: 'pre-wrap',
            }}
            {...(containsHTML ? { dangerouslySetInnerHTML: { __html: code } } : { children: code })}
        />
    );
};

export default PlainOutput;
