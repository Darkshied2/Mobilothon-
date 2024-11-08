// -------------for training another dataset by user----------------


// import React, { useState, useContext } from 'react';
// import axios from 'axios';
// import Navbar from './Navbar';
// import { AuthContext } from '../AuthContext';

// function Challenge() {
//   const [results, setResults] = useState(null);
//   const { authToken, logout } = useContext(AuthContext);
//   console.log('Auth Token:', authToken);  // Add this to see the token format
//   const handleTrain = async () => {
//     try {
//       console.log('Sending JWT Token:', authToken);  // Debugging: Print the token
//       const response = await axios.post(
//         'http://localhost:5000/train',
//         {
//           x_train: [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]],
//           y_train: [0, 1, 1],
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setResults(response.data);
//     } catch (error) {
//       if (error.response && error.response.status === 401) {
//         // Token is expired or invalid, log out the user
//         alert('Session has expired. Please log in again.');
//         logout();  // Log the user out and clear the token
//       } else {
//         console.log(error.response);  // Log the error response for debugging
//         alert('Training failed: ' + error.response?.data?.msg || 'Unknown error');
//       }
//     }
//   };

//   return (
//     <div>
//       <Navbar />
//       <h2>Train Your Model</h2>
//       <button onClick={handleTrain}>Start Training</button>
//       {results && (
//         <div>
//           <p>Loss: {results.loss}, Accuracy: {results.accuracy}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Challenge;


//  ---------------prediction------------------

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

function Challenge() {
  // State for form data input
  const [formData, setFormData] = useState({
    national_inv: '',
    lead_time: '',
    sales_1_month: '',
    pieces_past_due: '',
    perf_6_month_avg: '',
    in_transit_qty: '',
    local_bo_qty: '',
    deck_risk: '',
    oe_constraint: '',
    ppap_risk: '',
    stop_auto_buy: '',
    rev_stop: '',
  });
  
  // State for prediction result
  const [prediction, setPrediction] = useState(null);

  // State for prediction history
  const [history, setHistory] = useState([]);

  // Access the authentication context
  const { authToken } = useContext(AuthContext);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  // Function to send input data to the backend and get the prediction
  // const handlePredict = async () => {
  //   try {
  //     const response = await axios.post(
  //       'http://localhost:5000/predict', // Ensure this matches your backend route
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     );
  //     setPrediction(response.data.prediction);  // Update state with the prediction
  //   } catch (error) {
  //     console.log(error.response);
  //     alert('Prediction failed: ' + (error.response?.data?.msg || 'Unknown error'));
  //   }
  // };



//  Function to send input data to the backend and get the prediction
 const handlePredict = async () => {
  try {
    // Ensure that all input fields have values, otherwise send default or placeholder values.
    const payload = {
      ...formData,
      national_inv: formData.national_inv || 0,
      lead_time: formData.lead_time || 0,
      sales_1_month: formData.sales_1_month || 0,
      pieces_past_due: formData.pieces_past_due || 0,
      perf_6_month_avg: formData.perf_6_month_avg || 0,
      in_transit_qty: formData.in_transit_qty || 0,
      local_bo_qty: formData.local_bo_qty || 0,
      deck_risk: formData.deck_risk || 0,
      oe_constraint: formData.oe_constraint || 0,
      ppap_risk: formData.ppap_risk || 0,
      stop_auto_buy: formData.stop_auto_buy || 0,
      rev_stop: formData.rev_stop || 0,
    };

    const response = await axios.post(
      'http://localhost:5000/predict',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    setPrediction(response.data.prediction);
  } catch (error) {
    console.error("Error details:", error);

    // Improved logging for axios errors
    if (error.response) {
      // Backend responded with a status code other than 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);

      alert('Prediction failed: ' + (error.response.data.msg || 'Unknown error from backend'));
    } else if (error.request) {
      // Request was made but no response received
      console.error('Request data:', error.request);
      alert('Prediction failed: No response from the backend.');
    } else {
      // Something else happened in setting up the request
      console.error('Error message:', error.message);
      alert('Prediction failed: ' + error.message);
    }
  }
};






  // Fetch prediction history when the component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/history', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setHistory(response.data);  // Update state with the fetched history
      } catch (error) {
        console.log(error);
      }
    };

    fetchHistory();
  }, [authToken]);

  return (
    <div>

      {/* Prediction Form */}
      <h2>Backorder Prediction</h2>
      <form>
    <input name="national_inv" placeholder="National inv" value={formData.national_inv} onChange={handleChange} />
    <input name="lead_time" placeholder="Lead time" value={formData.lead_time} onChange={handleChange} />
    <input name="sales_1_month" placeholder="Sales 1 month" value={formData.sales_1_month} onChange={handleChange} />
    <input name="pieces_past_due" placeholder="Pieces Past Due" value={formData.pieces_past_due} onChange={handleChange} />
    <input name="perf_6_month_avg" placeholder="Perf 6 Month Avg" value={formData.perf_6_month_avg} onChange={handleChange} />
    <input name="in_transit_qty" placeholder="In-transit qty" value={formData.in_transit_qty} onChange={handleChange} />
    <input name="local_bo_qty" placeholder="Local Bo Qty" value={formData.local_bo_qty} onChange={handleChange} />
    <input name="deck_risk" placeholder="Deck Risk" value={formData.deck_risk} onChange={handleChange} />
    <input name="oe_constraint" placeholder="OE Constraint" value={formData.oe_constraint} onChange={handleChange} />
    <input name="ppap_risk" placeholder="PPAP Risk" value={formData.ppap_risk} onChange={handleChange} />
    <input name="stop_auto_buy" placeholder="Stop Auto Buy" value={formData.stop_auto_buy} onChange={handleChange} />
    <input name="rev_stop" placeholder="Rev Stop" value={formData.rev_stop} onChange={handleChange} />
    <button type="button" onClick={handlePredict}>Predict</button>
</form>

      {/* Display Prediction Result */}
      {prediction !== null && <div>Prediction: {prediction}</div>}

      {/* Display Prediction History */}
      <h2>Prediction History</h2>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
            {`Prediction: ${entry.prediction}, Date: ${new Date(entry.timestamp).toLocaleString()}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Challenge;
