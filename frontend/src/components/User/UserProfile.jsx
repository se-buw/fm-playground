import React, { useState } from 'react';
import {
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane
} from 'mdb-react-ui-kit';
import Dashboard from './Dashboard';
import DiffEditor from '../Utils/DiffEditor';

const UserProfile = () => {
  const [basicActive, setBasicActive] = useState('tab1');

  const handleBasicClick = (value) => {
    if (value === basicActive) {
      return;
    }

    setBasicActive(value);
  };

  /**
   * @todo: Modify this component to display the user's profile information and allow them to edit it.
   */
  return (
    <div className='container' style={{ marginTop: '100px' }}>
      <MDBTabs className='mb-3'>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => handleBasicClick('tab1')} active={basicActive === 'tab1'}>
            Dashboard
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink onClick={() => handleBasicClick('tab2')} active={basicActive === 'tab2'}>
            Profile
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      <MDBTabsContent>
        <MDBTabsPane open={basicActive === 'tab1'}>
          <Dashboard />
        </MDBTabsPane>
        <MDBTabsPane open={basicActive === 'tab2'}>
          <DiffEditor />
        </MDBTabsPane>
      </MDBTabsContent>
    </div>
  );
}

export default UserProfile;