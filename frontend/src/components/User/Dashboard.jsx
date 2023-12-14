import React, { useEffect, useState } from 'react';
import { MDBDataTableV5 } from 'mdbreact';
import { MDBBtn} from 'mdbreact';
import { FaDownload, FaTrash } from 'react-icons/fa'
import { getHistories } from '../../api/playgroundApi';
import axiosAuth from '../../api/axiosAuth';

/**
 * @todo: Probably we won't be using this component in the final version of the app. 
 * @returns 
 */
export default function Dashboard() {
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: 'Time (CEST)',
        field: 'time',
        width: 150,
        sort: 'desc',
        attributes: {
          'aria-controls': 'DataTable',
          'aria-label': 'Time',
        },
      },
      {
        label: 'Code',
        field: 'code',
        sort: 'desc',
        width: 100,
        noWrap: true,
      },
      {
        label: 'Permalink',
        field: 'permalink',
        width: 200,
      },
      {
        label: 'Download',
        field: 'copy',
        width: 200,
      },
      {
        label: 'Delete',
        field: 'delete',
        width: 200,
      },
    ],
    rows: [
    ],
  });

  // Fetch the user's data from the API
  useEffect(() => {
    getData().then(() => {
      console.log('Data fetched')
    })
  }, [])

  // Fetch the user's data from the API
  const getData = async () => {
    await getHistories()
      .then((res) => {
        console.log(res)
        setDatatable({
          ...datatable,
          rows: res.data.history
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // Function to format the date get from the API
  const formatApiDate = (apiDate) => {
    const dateObject = new Date(apiDate);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');
    const amPm = dateObject.getHours() >= 12 ? 'PM' : 'AM';

    return `${year}-${month}-${day} ${hours}:${minutes} ${amPm}`;
  };

  // Function to generate the permalink from the API by combining the check and permalink
  const generatePermalink = (rowData) => {
    const { check, permalink } = rowData;
    const permalinkUrl = `${window.location.origin}/?check=${encodeURIComponent(check)}&p=${encodeURIComponent(permalink)}`;
    return <a href={permalinkUrl} target="_blank" rel="noopener noreferrer">{permalinkUrl}</a>;
  };

  // Function to format the code for display in the table by truncating it
  const formatCodeForDisplay = (rowData) => {
    const { code } = rowData
    return <code>{code.length > 50 ? code.substring(0, 50) + '...' : code}</code>;
  }

  // Function to render the download button in the table row
  const renderDownloadActions = (rowData) => (
    <div>
      <MDBBtn className='btn btn-dark btn-rounded' onClick={() => handleDownloadButtonClick(rowData)}>
        <FaDownload
          role='button'
        />
      </MDBBtn>
    </div>
  );
  
  // Function to render the delete button in the table row
  const renderDeleteActions = (rowData) => (
    <div>
      <MDBBtn className='btn btn-danger btn-rounded' onClick={() => handleDeleteButtonClick(rowData)}>
        <FaTrash
          role='button'
        />
      </MDBBtn>
      <i className="fa fa-icon-class" onClick={() => handleDeleteButtonClick(rowData)}></i>
    </div>
  );

  // Function to handle the delete button click
  const handleDeleteButtonClick = async (rowData) => {
    const res = await axiosAuth.put('http://localhost:8000/api/unlink-history', {
      id: rowData.id
    }).then((res) => {
      console.log(res)
      getData()
    }).catch((err) => {
      console.log(err)
    })
  };

  // Function to handle the download button click
  const handleDownloadButtonClick = (rowData) => {
    const content = rowData.code
    const fileName = rowData.permalink
    const fileExtension = rowData.cehck == 'SMT' ? 'smt2' : rowData.cehck == 'XMV' ? 'smv' : rowData.cehck == 'als' ? 'als' : 'txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');

    link.href = window.URL.createObjectURL(blob);
    link.download = `${fileName}.${fileExtension}`;
    link.click();

  };

  // Function to handle the download all user data button click
  const handleUSerData = async () => {
    const rowsWithoutId = datatable.rows.map(({ id, ...rowWithoutId }) => rowWithoutId);

    const jsonData = JSON.stringify(rowsWithoutId);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  return (
    <div className='container' style={{ marginTop: '100px', marginBottom: '20px' }}>
      <div className='d-flex justify-content-end'>
        <MDBBtn className='btn btn-dark btn-rounded' onClick={() => handleUSerData()}>
          Download Your Data
        </MDBBtn>
      </div>
      <h2 className='mx-auto text-center'>History</h2>
      <MDBDataTableV5
        hover
        entriesOptions={[5, 20, 25]}
        entries={5}
        pagesAmount={4}
        data={{
          columns: datatable.columns,
          rows: datatable.rows.map((row) => {
            return {
              ...row,
              time: formatApiDate(row.time),
              code: formatCodeForDisplay(row),
              permalink: generatePermalink(row),
              copy: renderDownloadActions(row),
              delete: renderDeleteActions(row)

            }
          })
        }}
        pagingTop
        searchTop
        searchBottom={false}
        barReverse
        responsive
      />
    </div>
  );
}
