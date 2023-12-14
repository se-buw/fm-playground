import React from 'react';
import data from '../../assets/config/Guides.json';

/**
 * Display the guides for the selected tool.
 * Guides are fetched from the config file and displayed in a list.
 * @see: assets/config/Guides.json
 * @param {*} id - The selected tool
 * @returns 
 */
const Guides = ({ id }) => {
  const guideData = data[id];

  if (!guideData) {
    return (
      <div>
        <h2>{id}</h2>
        <p>No data available for {id}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Guides</h2>
      <div className="row">
        {guideData.map((item, index) => (
          <div key={index} className="col-md-4" style={{ marginBottom: '8px' }}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{<a target="_blank" rel="noopener noreferrer" href={item.link}>{item.title} </a>}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Guides;
