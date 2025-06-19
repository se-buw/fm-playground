import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAtom } from 'jotai';
import { alloyInstanceAtom } from '@/atoms';
import '@/assets/style/AlloyOutput.css';

/**
 * Interface for the CnD API request body
 */
interface CnDApiRequest {
  alloydatum: string; // The Alloy instance XML data
  cope: string; // Layout specification/configuration
  instancenumber: number; // Instance number (default: 0)
  loggingEnabled: string; // Enable logging ("true"/"false")
}

/**
 * Sends Alloy instance data to the CnD (Cope and Drag) API for diagram generation.
 *
 * API Format:
 * POST /cnd
 * Content-Type: application/json
 *
 * Request Body:
 * {
 *   "alloydatum": "string",     // The Alloy instance XML data
 *   "cope": "string",           // Layout specification/configuration
 *   "instancenumber": number,   // Instance number (default: 0)
 *   "loggingEnabled": "string"  // Enable logging ("true"/"false")
 * }
 *
 * @param instanceData - The Alloy instance XML data
 * @param cope - Layout specification for the diagram
 * @param instanceNumber - The instance number to generate diagram for
 * @param loggingEnabled - Whether to enable logging
 * @returns Promise<string> - HTML content for the generated diagram
 */
async function sendInstanceToCnDApi(
  instanceData: string,
  cope: string = '',
  instanceNumber: number = 0,
  loggingEnabled: string = 'false'
) {
  try {
    const requestBody: CnDApiRequest = {
      alloydatum: instanceData,
      cope: cope,
      instancenumber: instanceNumber,
      loggingEnabled: loggingEnabled,
    };

    const response = await axios.post('/cnd', requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error calling CnD API:', error);
    throw error;
  }
}

const AlloyCndOutput = () => {
  const [alloyInstance] = useAtom(alloyInstanceAtom);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const cope = `directives:
  - flag: hideDisconnectedBuiltIns`;

  // Function to regenerate diagram with new parameters
  const regenerateDiagram = useCallback(
    async (params: { alloydatum: string; cope: string; instancenumber: number; loggingEnabled: string }) => {
      setLoading(true);
      setError('');

      try {
        const html = await sendInstanceToCnDApi(
          params.alloydatum,
          params.cope,
          params.instancenumber,
          params.loggingEnabled
        );
        setHtmlContent(html);
        console.log('HTML content regenerated from CnD API:', html);
      } catch (err: any) {
        setError('Failed to regenerate diagram: ' + err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message from iframe:', event.data);

      if (event.data.type === 'REGENERATE_DIAGRAM') {
        console.log('Regenerating diagram with params:', event.data.data);
        regenerateDiagram(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [regenerateDiagram]);

  useEffect(() => {
    if (alloyInstance && typeof alloyInstance === 'string') {
      setLoading(true);
      setError('');

      // Send the XML instance data with default parameters for now
      // You can extend this to accept cope, instancenumber, and loggingEnabled as props if needed
      sendInstanceToCnDApi(alloyInstance, cope, 0, 'false')
        .then((html) => {
          setHtmlContent(html);
          console.log('HTML content received from CnD API:', html);
        })
        .catch((err) => {
          setError('Failed to process instance data: ' + err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [alloyInstance]); // Process HTML content to ensure scripts can load and handle form submissions
  const processHtmlContent = (htmlContent: string) => {
    console.log('Processing HTML content...');

    // Remove any existing CSP headers that might block scripts
    let processedHtml = htmlContent.replace(/<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');

    // TODO: fix the urls with container name if running inside a container and port is not being exposed
    processedHtml = processedHtml
      .replace(/src=["']\/js\//g, 'src="http://localhost:3000/js/')
      .replace(/href=["']\/css\//g, 'href="http://localhost:3000/css/')
      .replace(/src=["']\/img\//g, 'src="http://localhost:3000/img/')
      .replace(/href=["']\/img\//g, 'href="http://localhost:3000/img/');

    // Add permissive CSP and fix base href
    processedHtml = processedHtml.replace(
      '<head>',
      `<head>
        <meta http-equiv="Content-Security-Policy" content="default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; style-src * data: 'unsafe-inline'; connect-src *;">
        <base href="http://localhost:3000/">`
    );

    // Add error handling for failed script loads
    const errorHandlingScript = `
      <script>
        console.log('CnD: Error handling script loaded');
        
        // Log all script load errors
        window.addEventListener('error', function(e) {
          console.error('CnD: Script error:', e.filename, e.message);
          if (e.target && e.target.tagName === 'SCRIPT') {
            console.error('CnD: Failed to load script:', e.target.src);
          }
        });
        
        // Check for required globals after load
        window.addEventListener('load', function() {
          console.log('CnD: Window loaded, checking globals...');
          setTimeout(() => {
            console.log('CnD: Globals check:');
            console.log('- jQuery ($):', typeof $);
            console.log('- d3:', typeof d3);
            console.log('- CodeMirror:', typeof CodeMirror);
            console.log('- jsyaml:', typeof jsyaml);
            console.log('- cola:', typeof cola);
            console.log('- Split:', typeof Split);
            
            // Try to manually trigger any initialization
            if (typeof $ !== 'undefined') {
              console.log('CnD: jQuery available, checking DOM...');
              console.log('- Forms found:', $('form').length);
              console.log('- Buttons found:', $('button').length);
              console.log('- Apply button:', $('#cola').length);
            }
            
            // Check if Bootstrap is working
            if (typeof $ !== 'undefined' && $.fn.modal) {
              console.log('CnD: Bootstrap seems to be loaded');
            }
            
          }, 1000);
        });
      </script>
    `;

    // Simple form override that doesn't interfere with other scripts
    const simpleFormScript = `
      <script>
        console.log('CnD: Simple form script loaded');
        
        // Wait longer for everything to initialize
        setTimeout(function() {
          console.log('CnD: Setting up form override...');
          
          const applyButton = document.getElementById('cola');
          if (applyButton) {
            console.log('CnD: Found apply button, setting up click handler');
            
            // Just add a click listener without removing existing ones
            applyButton.addEventListener('click', function(e) {
              console.log('CnD: Apply button clicked');
              
              // Only prevent if this is actually a form submission
              const form = this.closest('form');
              if (form) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('CnD: Prevented form submission, getting data...');
                
                const alloydatum = document.getElementById('alloydatum')?.value || '';
                const cope = window.editor ? window.editor.getValue() : (document.getElementById('cope')?.value || '');
                
                console.log('CnD: Sending message to parent...');
                window.parent.postMessage({
                  type: 'REGENERATE_DIAGRAM',
                  data: {
                    alloydatum: alloydatum,
                    cope: cope,
                    instancenumber: 0,
                    loggingEnabled: 'false'
                  }
                }, '*');
              }
            }, true); // Use capture
          } else {
            console.log('CnD: Apply button not found');
          }
        }, 3000); // Wait 3 seconds
      </script>
    `;

    // Insert scripts at the end
    processedHtml = processedHtml.replace('</body>', errorHandlingScript + simpleFormScript + '</body>');

    console.log('HTML processing complete');
    return processedHtml;
  };

  if (loading) {
    return (
      <div className='alloy-output-container'>
        <div className='loading-message'>Processing instance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='alloy-output-container'>
        <div className='error-message' style={{ color: 'red', padding: '20px' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!alloyInstance) {
    return (
      <div className='alloy-output-container'>
        <div className='no-data-message'>No instance data available</div>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className='alloy-output-container'>
        <pre
          id='info'
          className='plain-output-box'
          contentEditable={false}
          style={{
            borderRadius: '8px',
            height: '60vh',
            whiteSpace: 'pre-wrap',
          }}
        >
          No diagram generated yet.
        </pre>
      </div>
    );
  }

  return (
    <div className='alloy-output-container'>
      <iframe
        key={htmlContent} // Force iframe to reload when content changes
        srcDoc={processHtmlContent(htmlContent)}
        style={{
          width: '100%',
          height: '90vh',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
        title='Cope and Drag Visualization'
        // No sandbox restrictions - allow everything
        referrerPolicy='no-referrer'
      />
    </div>
  );
};

export default AlloyCndOutput;
