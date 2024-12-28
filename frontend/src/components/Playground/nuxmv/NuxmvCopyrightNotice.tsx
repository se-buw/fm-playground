import { useState } from 'react';
import NuxmvCopyrightNoticeModal from '@/components/Playground/nuxmv/NuxmvCopyrightNoticeModal';

const NuxmvCopyrightNotice = () => {
  const [isNuxmvModalOpen, setIsNuxmvModalOpen] = useState(false);

  return (
    <div className='col-md-12'>
      <a
        style={{ cursor: 'pointer', textDecoration: 'underline' }}
        role='button'
        onClick={() => setIsNuxmvModalOpen(true)}
      >
        nuXmv Copyright Notice
      </a>
      {/* Render the modal conditionally */}
      {isNuxmvModalOpen && (
        <NuxmvCopyrightNoticeModal
          isNuxmvModalOpen={isNuxmvModalOpen}
          setIsNuxmvModalOpen={setIsNuxmvModalOpen}
          toggleNuxmvModal={() => setIsNuxmvModalOpen(!isNuxmvModalOpen)}
        />
      )}
    </div>
  );
};

export default NuxmvCopyrightNotice;
