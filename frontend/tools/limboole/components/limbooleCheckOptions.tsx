import Select, { SingleValue } from 'react-select';
import { useAtom } from 'jotai';
import { limbooleCliOptionsAtom } from '@/atoms';

const LimbooleCheckOptions = () => {
    const options = [
        { value: '0', label: 'Validity' },
        { value: '1', label: 'Satisfiability' },
        { value: '2', label: 'QBF Satisfiability' },
    ];
    const [, setLimbooleCheckOption] = useAtom(limbooleCliOptionsAtom);

    const handleOptionChange = (selectedOption: SingleValue<{ value: string; label: string }>) => {
        if (selectedOption) {
            setLimbooleCheckOption(selectedOption);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
            <p style={{ marginRight: '10px', marginTop: '5px' }}>Check:</p>
            <div style={{ width: '70%' }}>
                <Select
                    className='basic-single react-select-container'
                    classNamePrefix='select'
                    defaultValue={options[1] || null}
                    isDisabled={false}
                    isLoading={false}
                    isClearable={false}
                    isRtl={false}
                    isSearchable={true}
                    options={options}
                    onChange={handleOptionChange}
                />
            </div>
        </div>
    );
};

export default LimbooleCheckOptions;
